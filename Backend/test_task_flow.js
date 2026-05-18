import sequelize from "./src/db.js";
import { User, Task, UserTaskHistory, Transaction } from "./src/models/index.js";

async function testFlow() {
  try {
    await sequelize.authenticate();
    console.log("DB Connected.");

    // 1. Fetch Test User
    const user = await User.findOne({ where: { email: "test@example.com" } });
    if (!user) throw new Error("Test user not found");
    console.log(`Initial Balance: ${user.coinBalance}`);

    // 2. Fetch a Task
    const task = await Task.findOne();
    if (!task) throw new Error("No task found");
    console.log(`Testing Task: ${task.title} (Reward: ${task.rewardCoins})`);

    // 3. Start Task
    console.log("--- Starting Task ---");
    const [history, created] = await UserTaskHistory.findOrCreate({
      where: { user_id: user.id, task_id: task.id },
      defaults: { status: 'started', startedAt: new Date() }
    });
    console.log(`History created/found. Status: ${history.status}`);

    // 4. Verify Task (simulate the verifyTask logic)
    console.log("--- Verifying Task ---");
    const transaction = await sequelize.transaction();
    try {
      if (history.status === 'completed') {
        console.log("Task was already completed. Skipping reward.");
      } else {
        // Update History
        history.status = 'completed';
        history.completedAt = new Date();
        await history.save({ transaction });

        // Update User Wallet
        user.coinBalance = parseFloat(user.coinBalance) + parseFloat(task.rewardCoins);
        await user.save({ transaction });

        // Create Transaction Record
        await Transaction.create({
          user_id: user.id,
          amount: task.rewardCoins,
          transactionType: "task_reward",
          referenceId: task.id
        }, { transaction });

        await transaction.commit();
        console.log(`Success! New Balance: ${user.coinBalance}`);
      }
    } catch (err) {
      await transaction.rollback();
      console.error("Verification Transaction Failed:", err);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testFlow();
