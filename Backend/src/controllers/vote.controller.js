import VoteService from "../services/vote.service.js";

const VoteController = {
  async getMyVotes(req, res) {
    try {
      const userId = req.user.userId; // ✅ FIXED
      const votes = await VoteService.getVotesByUser(userId);
      res.json(votes);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async castVote(req, res) {
    try {
      const userId = req.user.userId;
      const { election_id, team } = req.body;

      const vote = await VoteService.castVote(userId, election_id, team);
      res.status(201).json(vote);
    } catch (err) {
      console.error("VOTE ERROR:", err.message);
      res.status(400).json({ error: err.message });
    }
  }
};

export default VoteController;
