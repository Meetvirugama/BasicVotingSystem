import Vote from "../models/Vote.js";
import Election from "../models/Election.js";
import sequelize from "../db.js";

const VoteService = {
  /* ===========================
     GET MY VOTES (IMPORTANT)
     Used by frontend to show
     already voted buttons
  ============================ */
  async getVotesByUser(userId) {
    return await Vote.findAll({
      where: { user_id: userId },
      attributes: ["election_id", "team"],
    });
  },

  /* ===========================
     CAST VOTE
  ============================ */
  async castVote(userId, electionId, team) {
    return await sequelize.transaction(async (t) => {
      // 🔍 Find election
      const election = await Election.findByPk(electionId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!election) throw new Error("Election not found");

      if (election.status !== "active") {
        throw new Error("Election not active");
      }

      // ❌ Prevent double voting
      const already = await Vote.findOne({
        where: {
          user_id: userId,
          election_id: electionId,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (already) throw new Error("Already voted");

      // ✅ Create vote
      await Vote.create(
        {
          user_id: userId,
          election_id: electionId,
          team,
        },
        { transaction: t }
      );

      // ✅ Increment count safely
      if (team === "A") {
        await election.increment("CA", { by: 1, transaction: t });
      } else if (team === "B") {
        await election.increment("CB", { by: 1, transaction: t });
      } else {
        throw new Error("Invalid team");
      }

      return {
        success: true,
        election_id: electionId,
        team,
      };
    });
  },
};

export default VoteService;
