import { GeneratedPoll } from "../models/index.js";
import { triggerAutonomousCrawl, approveAndPublishPoll } from "../services/autogen.service.js";

// Global configurations (can be managed in-memory for the demo session)
let generatorSettings = {
  isEnabled: true,
  crawlInterval: 30,
  confidenceThreshold: 0.80,
  autoPublishThreshold: 85.0
};

export const getGeneratorSettings = async (req, res) => {
  res.json({ success: true, settings: generatorSettings });
};

export const updateGeneratorSettings = async (req, res) => {
  const { isEnabled, crawlInterval, confidenceThreshold, autoPublishThreshold } = req.body;
  generatorSettings = {
    isEnabled: isEnabled !== undefined ? isEnabled : generatorSettings.isEnabled,
    crawlInterval: crawlInterval || generatorSettings.crawlInterval,
    confidenceThreshold: confidenceThreshold || generatorSettings.confidenceThreshold,
    autoPublishThreshold: autoPublishThreshold || generatorSettings.autoPublishThreshold
  };
  res.json({ success: true, message: "Settings updated successfully!", settings: generatorSettings });
};

export const getGeneratedPollsQueue = async (req, res) => {
  try {
    const queue = await GeneratedPoll.findAll({
      order: [["priorityScore", "DESC"], ["createdAt", "DESC"]]
    });
    res.json({ success: true, queue });
  } catch (err) {
    console.error("GET QUEUE ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching generator queue." });
  }
};

export const triggerManualCrawl = async (req, res) => {
  try {
    const items = await triggerAutonomousCrawl();
    res.json({ success: true, message: `Scraper crawling executed successfully! ${items.length} new predictions queued.`, items });
  } catch (err) {
    console.error("CRAWL TRIGGER ERROR:", err);
    res.status(500).json({ success: false, error: "Server error executing autonomous events crawl." });
  }
};

export const approveGeneratedPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await approveAndPublishPoll(id);
    res.json({ success: true, message: "Poll approved and published successfully!", poll });
  } catch (err) {
    console.error("APPROVE GENERATED POLL ERROR:", err);
    res.status(500).json({ success: false, error: err.message || "Server error approving prediction poll." });
  }
};

export const rejectGeneratedPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const gp = await GeneratedPoll.findByPk(id);
    if (!gp) return res.status(404).json({ success: false, error: "Generated poll not found" });

    gp.moderationStatus = "rejected";
    gp.rejectionReason = reason || "Manual rejection by platform administrator";
    await gp.save();

    res.json({ success: true, message: "Poll successfully rejected and removed from pending queue." });
  } catch (err) {
    console.error("REJECT GENERATED POLL ERROR:", err);
    res.status(500).json({ success: false, error: "Server error rejecting prediction poll." });
  }
};
