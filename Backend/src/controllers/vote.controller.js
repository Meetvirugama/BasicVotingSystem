import VoteService from "../services/vote.service.js";

const VoteController = {
  async getMyVotes(req, res) {
    try {
      const userId = req.user.userId;
      const votes = await VoteService.getVotesByUser(userId);
      res.json(votes);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async castVote(req, res) {
    try {
      const userId = req.user.userId;
      const { election_id, candidate_id, fingerprint } = req.body;

      const vote = await VoteService.castVote(userId, election_id, candidate_id, fingerprint);
      res.status(201).json(vote);
    } catch (err) {
      console.error("VOTE ERROR:", err.message);
      res.status(400).json({ error: err.message });
    }
  },

  async verifyReceipt(req, res) {
    try {
      const { hash } = req.params;
      const result = await VoteService.verifyReceiptByHash(hash);
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
};

export default VoteController;
