import * as auditService from "../services/audit.service.js";

export async function getAll(req, res) {
  try {
    const logs = await auditService.getAuditLogs(req);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
