const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined. Set it in environment variables.");
}

const refreshToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      const errorMessage =
        err.name === 'TokenExpiredError' ? 'Token has expired' :
        err.name === 'JsonWebTokenError' ? 'Invalid token' :
        'Token verification failed';
      return res.status(403).json({ message: errorMessage });
    }

    req.user = user;
    next();
  });
};

module.exports = {refreshToken};
