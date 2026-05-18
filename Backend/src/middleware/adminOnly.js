/**
 * Middleware: only allows users with role === 'admin' to proceed.
 * Must be used AFTER verifyBackendToken so req.user is populated.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Forbidden: Admins only." });
  }
  next();
};

export default adminOnly;
