import { AuditLog, User } from "../models/index.js";

export async function getAuditLogs(req) {
  return await AuditLog.findAll({
    include: [{ model: User, attributes: ["name", "email"] }],
    order: [["createdAt", "DESC"]],
    limit: 100
  });
}
