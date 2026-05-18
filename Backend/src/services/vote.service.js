import Vote from "../models/Vote.js";
import Election from "../models/Election.js";
import sequelize from "../db.js";
import crypto from "crypto";

const VoteService = {
  /* ===========================
     GET MY VOTES
  ============================ */
  async getVotesByUser(userId) {
    return await Vote.findAll({
      where: { user_id: userId },
      attributes: ["election_id", "candidate_id", "receipt_hash", "createdAt"],
      include: [
        {
          model: Election,
          attributes: ["title", "candidates", "status"]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  },

  /* ===========================
     VERIFY RECEIPT BY HASH
  ============================ */
  async verifyReceiptByHash(hash) {
    const vote = await Vote.findOne({
      where: { receipt_hash: hash },
      include: [{ model: Election, attributes: ["title", "candidates"] }]
    });

    if (!vote) throw new Error("Verification failed: Receipt hash not found in the secure ledger.");

    const candidate = vote.Election?.candidates?.find(c => c.id === vote.candidate_id);

    return {
      election_title: vote.Election?.title,
      candidate_name: candidate?.name || "Anonymous Choice",
      timestamp: vote.createdAt
    };
  },

  /* ===========================
     CAST VOTE (N-CANDIDATE SUPPORT)
  ============================ */
  async castVote(userId, electionId, candidateId, fingerprint) {
    return await sequelize.transaction(async (t) => {
      // 🔍 Find election
      const election = await Election.findByPk(electionId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!election) throw new Error("Election not found");
      if (election.status !== "active") throw new Error("Election not active");

      // ❌ Check if candidate exists in this election
      const candidates = election.candidates || [];
      const candidateIndex = candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error("Candidate not found in this election.");

      // 🚫 Security: User-level double voting check
      const alreadyUser = await Vote.findOne({
        where: { user_id: userId, election_id: electionId },
        transaction: t,
      });
      if (alreadyUser) throw new Error("You have already voted in this election.");

      // 🚫 Security: Device-level double voting check (Anti-Sybil)
      if (fingerprint) {
        const alreadyFingerprint = await Vote.findOne({
          where: { election_id: electionId, fingerprint: fingerprint },
          transaction: t,
        });
        if (alreadyFingerprint) {
          throw new Error("This device has already been used to vote in this election.");
        }
      }

      // 🔐 Generate Receipt Hash
      const salt = process.env.VOTE_SECRET || "secure-voting-secret";
      const receiptHash = crypto
        .createHash("sha256")
        .update(`${userId}-${electionId}-${candidateId}-${salt}-${Date.now()}`)
        .digest("hex")
        .substring(0, 16);

      // ✅ Create vote record
      await Vote.create(
        {
          user_id: userId,
          election_id: electionId,
          candidate_id: candidateId,
          fingerprint,
          receipt_hash: receiptHash
        },
        { transaction: t }
      );

      // ✅ Update Candidate Vote Count (Atomic Update for JSONB)
      candidates[candidateIndex].votes = (candidates[candidateIndex].votes || 0) + 1;
      
      // We must tell Sequelize the JSON has changed
      election.changed('candidates', true);
      await election.save({ transaction: t });

      return {
        success: true,
        election_id: electionId,
        candidate_id: candidateId,
        receipt: receiptHash
      };
    });
  },
};

export default VoteService;
