import sequelize from "./src/db.js";
import { User, Category, TaskCategory, Task } from "./src/models/index.js";

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");
    
    // Sync DB
    await sequelize.sync({ force: true });
    console.log("DB Synced.");

    // Create Test User
    const user = await User.create({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "TestUser",
      email: "test@example.com",
      password: "hashedpassword",
      isVerified: true,
      coinBalance: 1000,
      reputationScore: 500,
      level: "Active"
    });
    console.log("Created Test User:", user.id);

    // Create Categories
    await Category.bulkCreate([
      { name: "Esports", description: "Competitive gaming tournaments.", minCoinRequirement: 10 },
      { name: "AI Tech", description: "Predictions on AI advancements.", minCoinRequirement: 50 },
      { name: "YouTube", description: "Creator milestones and drama.", minCoinRequirement: 20 },
      { name: "Sports", description: "Real world sports events.", minCoinRequirement: 10 }
    ]);
    console.log("Created Categories.");

    // Create Task Categories
    const [tcGithub, tcSurvey] = await TaskCategory.bulkCreate([
      { name: "GitHub", description: "Support our open-source projects.", icon: "github", status: "active" },
      { name: "Surveys", description: "Help us improve by sharing feedback.", icon: "clipboard", status: "active" }
    ], { returning: true });
    console.log("Created Task Categories.");

    // Create Tasks
    await Task.bulkCreate([
      {
        title: "Star us on GitHub",
        description: "Visit our GitHub repository and leave a star.",
        taskType: "visit_link",
        category_id: tcGithub.id,
        rewardCoins: 15,
        difficultyLevel: "easy",
        taskLink: "https://github.com/meetvirugama",
        verificationMethod: "click",
        minimumTimeRequirement: 5
      },
      {
        title: "Feedback Survey",
        description: "Take a 2-minute survey about your experience.",
        taskType: "user_input",
        category_id: tcSurvey.id,
        rewardCoins: 50,
        difficultyLevel: "medium",
        verificationMethod: "manual",
        minimumTimeRequirement: 60
      }
    ]);
    console.log("Created Tasks.");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
