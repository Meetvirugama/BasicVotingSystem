import * as electionService from "../services/election.service.js";

export async function create(req, res) {
  try {
    const election = await electionService.createElection(req);
    res.status(201).json(election);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAll(req, res) {
  try {
    const elections = await electionService.getAllElections(req);
    res.json(elections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    const election = await electionService.updateElection(req);
    res.json(election);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function deleteElection(req, res) {
  try {
    await electionService.deleteElection(req);
    res.json({ success: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function getOne(req, res) {
  try {
    const election = await electionService.getElectionById(req);
    res.json(election);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
