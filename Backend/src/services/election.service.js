import { Election } from "../models/index.js";

export async function createElection(req) {
  const userId = req.user.userId;
  const { start_date, end_date } = req.body;
  const now = new Date();

  let status = "active";
  if (now < new Date(start_date)) status = "draft";
  if (now > new Date(end_date)) status = "closed";

  return await Election.create({
    ...req.body,
    created_by: userId,
    status
  });
}

export async function getAllElections(req) {
  const elections = await Election.findAll({
    order: [["createdAt", "DESC"]],
  });

  // 🔒 Hide votes from voters (optional)
  /*
  if (req.user.role === "voter") {
    elections.forEach(e => {
      if (e.status === "active") {
        e.CA = undefined;
        e.CB = undefined;
      }
    });
  }
  */

  return elections;
}

export async function updateElection(req) {
  const election = await Election.findByPk(req.params.id);
  if (!election) {
    const error = new Error("Election not found");
    error.status = 404;
    throw error;
  }

  await election.update(req.body);
  return election;
}

export async function deleteElection(req) {
  const election = await Election.findByPk(req.params.id);
  if (!election) {
    const error = new Error("Election not found");
    error.status = 404;
    throw error;
  }

  await election.destroy();
}

export async function getElectionById(req) {
  const election = await Election.findByPk(req.params.id);

  if (!election) {
    const error = new Error("Election not found");
    error.status = 404;
    throw error;
  }

  return election;
}
