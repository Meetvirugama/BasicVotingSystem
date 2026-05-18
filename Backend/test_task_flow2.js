import sequelize from "./src/db.js";
import { User, Task, UserTaskHistory, Transaction } from "./src/models/index.js";

async function testFlow() {
  try {
    await sequelize.authenticate();
    
    const user = await User.findOne({ where: { email: "test@example.com" } });
    console.log(`Initial Balance: ${user.coinBalance}`);

    const task = await Task.findOne({ where: { title: "Feedback Survey" } });
    console.log(`Testing Task: ${task.title} (Reward: ${task.rewardCoins})`);

    const [history, created] = await UserTaskHistory.findOrCreate({
      where: { user_id: user.id, task_id: task.id },
      defaults: { status: 'started', startedAt: new Date() }
    });

    const transaction = await sequelize.transaction();
    try {
        history.status = 'completed';
        history.completedAt = new Date();
        await history.save({ transaction });

        user.coinBalance = parseFloat(user.coinBalance) + parseFloat(task.rewardCoins);
        await user.save({ transaction });

        await Transaction.create({
          user_id: user.id,
          amount: task.rewardCoins,
          transactionType: "task_reward",
          referenceId: task.id
        }, { transaction });

        await transaction.commit();
        console.log(`Success! New Balance: ${user.coinBalance}`);
    } catch (err) {
      await transaction.rollback();
      console.error(err);
    }
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}

testFlow();
