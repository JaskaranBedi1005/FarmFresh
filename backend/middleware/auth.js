const jwt  = require('jsonwebtoken');

/**
 * Express middleware: verifies the JWT Bearer token.
 * Attaches decoded payload to req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure role is normalized to lowercase for comparison
    req.user = { 
      ...decoded, 
      role: decoded.role ? decoded.role.toLowerCase() : 'customer' 
    }; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Role-based access control middleware.
 * Usage: requireRole('farmer')  or  requireRole('customer')
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || !req.user.role || req.user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ error: `Access restricted to ${role}s` });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
