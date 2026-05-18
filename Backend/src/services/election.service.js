import { Election, AuditLog } from "../models/index.js";

export async function createElection(req) {
  const userId = req.user.userId;
  const { start_date, end_date, candidates } = req.body;
  const now = new Date();

  let status = "active";
  if (now < new Date(start_date)) status = "draft";
  if (now > new Date(end_date)) status = "closed";

  const election = await Election.create({
    ...req.body,
    created_by: userId,
    status,
    candidates: candidates || [] // Expected: [{ id: "1", name: "Alice", votes: 0 }, ...]
  });

  // 📝 LOG ACTION
  await AuditLog.create({
    admin_id: userId,
    action: "CREATE_ELECTION",
    election_id: election.id,
    details: { title: election.title }
  });

  return election;
}

export async function getAllElections(req) {
  return await Election.findAll({
    order: [["createdAt", "DESC"]],
  });
}

export async function updateElection(req) {
  const election = await Election.findByPk(req.params.id);
  if (!election) {
    const error = new Error("Election not found");
    error.status = 404;
    throw error;
  }

  await election.update(req.body);

  // 📝 LOG ACTION
  await AuditLog.create({
    admin_id: req.user.userId,
    action: "UPDATE_ELECTION",
    election_id: election.id,
    details: { title: election.title }
  });

  return election;
}

export async function deleteElection(req) {
  const election = await Election.findByPk(req.params.id);
  if (!election) {
    const error = new Error("Election not found");
    error.status = 404;
    throw error;
  }

  const title = election.title;
  const id = election.id;

  await election.destroy();

  // 📝 LOG ACTION
  await AuditLog.create({
    admin_id: req.user.userId,
    action: "DELETE_ELECTION",
    election_id: id,
    details: { title }
  });
}

export async function closeElection(req) {
  const election = await Election.findByPk(req.params.id);
  if (!election) {
    const error = new Error("Election not found");
    error.status = 404;
    throw error;
  }

  await election.update({ status: "closed", end_date: new Date() });

  // 📝 LOG ACTION
  await AuditLog.create({
    admin_id: req.user.userId,
    action: "CLOSE_POLL",
    election_id: election.id,
    details: { title: election.title }
  });

  return election;
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
