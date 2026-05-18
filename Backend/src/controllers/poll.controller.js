import { Poll, PollOption, User, Category, Transaction, Vote } from "../models/index.js";
import sequelize from "../db.js";

export const createPoll = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, description, category_id, options, endTime } = req.body;
    
    if (!title || !category_id || !options || options.length < 2 || options.length > 10 || !endTime) {
      return res.status(400).json({ success: false, error: "Invalid poll data." });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found." });
    }

    const creationCost = category.minCoinRequirement;

    const user = await User.findByPk(req.user.userId, { transaction });
    if (!user || user.coinBalance < creationCost) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "Insufficient coins to create poll." });
    }

    // Deduct coins
    user.coinBalance = parseFloat(user.coinBalance) - creationCost;
    await user.save({ transaction });

    // Log transaction
    await Transaction.create({
      user_id: user.id,
      amount: -creationCost,
      transactionType: "poll_creation"
    }, { transaction });

    // Create Poll
    const poll = await Poll.create({
      creator_id: user.id,
      category_id: category.id,
      title,
      description,
      creationCost,
      startTime: new Date(),
      endTime: new Date(endTime)
    }, { transaction });

    // Initial liquidity distributed among options based on creation cost (House seeds the pool)
    const initialLiquidity = creationCost / options.length;

    // Create Options
    for (const optionName of options) {
      await PollOption.create({
        poll_id: poll.id,
        name: optionName,
        totalStaked: initialLiquidity
      }, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ success: true, poll });

  } catch (err) {
    await transaction.rollback();
    console.error("CREATE POLL ERROR:", err);
    res.status(500).json({ success: false, error: "Server error creating poll." });
  }
};

export const getPolls = async (req, res) => {
  try {
    const userId = req.user?.userId;
    let userVotes = [];
    if (userId) {
      userVotes = await Vote.findAll({
        where: { user_id: userId }
      });
    }
    const userVotedPollIds = new Set(userVotes.map(v => v.poll_id));

    const polls = await Poll.findAll({
      where: { status: 'active' },
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'reputationScore'] },
        { model: PollOption, as: 'options' }
      ],
      order: [["createdAt", "DESC"]]
    });

    const mappedPolls = polls.map(p => {
      const pollJson = p.toJSON();
      if (pollJson.creator) {
        pollJson.creator.username = pollJson.creator.name;
      }
      pollJson.hasPredicted = userVotedPollIds.has(p.id);
      return pollJson;
    });

    res.json({ success: true, polls: mappedPolls });
  } catch (err) {
    console.error("GET POLLS ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching polls." });
  }
};

export const getPollById = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const poll = await Poll.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'reputationScore'] },
        { model: PollOption, as: 'options' }
      ]
    });
    
    if (!poll) return res.status(404).json({ success: false, error: "Poll not found." });

    // Check if user has already predicted on this poll
    let userVote = null;
    if (userId) {
      userVote = await Vote.findOne({
        where: { user_id: userId, poll_id: poll.id }
      });
    }

    const pollJson = poll.toJSON();
    if (pollJson.creator) {
      pollJson.creator.username = pollJson.creator.name;
    }

    // Calculate dynamic odds for display
    let totalPool = 0;
    pollJson.options.forEach(opt => totalPool += parseFloat(opt.totalStaked));
    
    const oddsData = pollJson.options.map(opt => {
      const optionPool = parseFloat(opt.totalStaked);
      const odds = optionPool > 0 ? (totalPool * 0.9) / optionPool : 1.0;
      return {
        id: opt.id,
        name: opt.name,
        totalStaked: optionPool,
        currentOdds: parseFloat(odds.toFixed(4))
      };
    });

    res.json({ 
      success: true, 
      poll: pollJson, 
      totalPool, 
      odds: oddsData,
      hasPredicted: !!userVote,
      userPrediction: userVote
    });
  } catch (err) {
    console.error("GET POLL ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching poll." });
  }
};

export const predictPoll = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { option_id, stakeAmount } = req.body;
    const pollId = req.params.id;
    const userId = req.user.userId;

    if (!option_id || !stakeAmount || stakeAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid prediction data." });
    }

    const poll = await Poll.findByPk(pollId, { transaction });
    if (!poll || poll.status !== 'active' || new Date() > poll.endTime) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "Poll is not active or has ended." });
    }

    /* 
    if (poll.creator_id === userId) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "Creators cannot predict on their own polls." });
    }
    */

    // Check if user already voted
    const existingVote = await Vote.findOne({ where: { user_id: userId, poll_id: pollId }, transaction });
    if (existingVote) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "You have already made a prediction on this poll." });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user || user.coinBalance < stakeAmount) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "Insufficient coins." });
    }

    const allOptions = await PollOption.findAll({ where: { poll_id: pollId }, transaction });
    const selectedOption = allOptions.find(opt => opt.id === option_id);
    if (!selectedOption) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "Invalid option selected." });
    }

    // Calculate Dynamic Odds at this exact moment
    let totalPool = 0;
    allOptions.forEach(opt => totalPool += parseFloat(opt.totalStaked));
    
    // The current odds before the user's stake is added
    const optionPool = parseFloat(selectedOption.totalStaked);
    const lockedOdds = (totalPool * 0.9) / optionPool;

    // Deduct Stake
    user.coinBalance = parseFloat(user.coinBalance) - stakeAmount;
    await user.save({ transaction });

    // Log Transaction
    await Transaction.create({
      user_id: user.id,
      amount: -stakeAmount,
      transactionType: "prediction_stake",
      referenceId: poll.id
    }, { transaction });

    // Record Vote
    const vote = await Vote.create({
      user_id: user.id,
      poll_id: poll.id,
      option_id: selectedOption.id,
      stakeAmount,
      lockedOdds
    }, { transaction });

    // Update Option Pool
    selectedOption.totalStaked = parseFloat(selectedOption.totalStaked) + stakeAmount;
    await selectedOption.save({ transaction });

    await transaction.commit();
    res.json({ success: true, message: "Prediction placed successfully!", vote });

  } catch (err) {
    await transaction.rollback();
    console.error("PREDICT POLL ERROR:", err);
    res.status(500).json({ success: false, error: "Server error placing prediction." });
  }
};
