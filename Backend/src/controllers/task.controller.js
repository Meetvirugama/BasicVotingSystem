import { TaskCategory, Task, UserTaskHistory, TaskSubmission, Transaction, User } from "../models/index.js";
import sequelize from "../db.js";

// GET /api/tasks/categories
export const getTaskCategories = async (req, res) => {
  try {
    const categories = await TaskCategory.findAll({ where: { status: 'active' } });
    res.json({ success: true, categories });
  } catch (err) {
    console.error("GET TASK CATEGORIES ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching categories." });
  }
};

// GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Fetch all active tasks with their category
    const tasks = await Task.findAll({
      where: { status: 'active' },
      include: [{ model: TaskCategory, as: 'category' }]
    });

    // Fetch user's task history to determine status
    const history = await UserTaskHistory.findAll({ where: { user_id: userId } });
    
    // Map tasks and append their user-specific status
    const mappedTasks = tasks.map(task => {
      const userHistory = history.find(h => h.task_id === task.id);
      return {
        ...task.toJSON(),
        userStatus: userHistory ? userHistory.status : "not_started"
      };
    });

    res.json({ success: true, tasks: mappedTasks });
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching tasks." });
  }
};

// POST /api/tasks/:id/start
export const startTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;

    const task = await Task.findByPk(taskId);
    if (!task || task.status !== 'active') {
      return res.status(404).json({ success: false, error: "Task not available." });
    }

    const [history, created] = await UserTaskHistory.findOrCreate({
      where: { user_id: userId, task_id: taskId },
      defaults: { status: 'started', startedAt: new Date() }
    });

    if (!created && history.status === 'completed') {
      return res.status(400).json({ success: false, error: "Task already completed." });
    }

    res.json({ success: true, message: "Task started.", history });
  } catch (err) {
    console.error("START TASK ERROR:", err);
    res.status(500).json({ success: false, error: "Server error starting task." });
  }
};

// POST /api/tasks/:id/verify
export const verifyTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;

    const task = await Task.findByPk(taskId, { transaction });
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Task not found." });
    }

    const history = await UserTaskHistory.findOne({
      where: { user_id: userId, task_id: taskId },
      transaction
    });

    if (!history) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "You must start the task first." });
    }

    if (history.status === 'completed') {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "Task already completed." });
    }

    // Verify time requirement
    if (task.minimumTimeRequirement > 0) {
      const elapsedSeconds = (new Date() - new Date(history.startedAt)) / 1000;
      if (elapsedSeconds < task.minimumTimeRequirement) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          error: `You must wait at least ${task.minimumTimeRequirement} seconds before verifying. You have waited ${Math.floor(elapsedSeconds)}s.` 
        });
      }
    }

    // Depending on verificationMethod, we would do more complex logic here (e.g. quiz check, AI check)
    // For now, we simulate success for 'click' and 'manual' methods.
    
    // Update History
    history.status = 'completed';
    history.completedAt = new Date();
    await history.save({ transaction });

    // Reward User
    const user = await User.findByPk(userId, { transaction });
    user.coinBalance = parseFloat(user.coinBalance) + parseFloat(task.rewardCoins);
    user.reputationScore += 10; // Give some reputation
    await user.save({ transaction });

    // Log Transaction
    await Transaction.create({
      user_id: user.id,
      amount: task.rewardCoins,
      transactionType: "task_reward",
      referenceId: task.id
    }, { transaction });

    await transaction.commit();
    res.json({ success: true, message: "Task completed successfully!", coinsEarned: task.rewardCoins });

  } catch (err) {
    await transaction.rollback();
    console.error("VERIFY TASK ERROR:", err);
    res.status(500).json({ success: false, error: "Server error verifying task." });
  }
};
