const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: Token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'wawa_car_release_secret_key_2026_jwt', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAccess(settingRequired = false) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (settingRequired && req.user.setting_car_release !== 1) {
      return res.status(403).json({ success: false, message: 'Permission denied: Car release setting required' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireAccess
};
