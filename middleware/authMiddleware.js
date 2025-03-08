const jwt = require('jsonwebtoken');

// JWT secret key (make sure it is stored securely, e.g., in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET ;

// Middleware to authenticate the user based on the JWT token
const verifyToken = (req, res, next) => {
  // Get token from Authorization header (Bearer <token>)
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });
    }
    req.user = user;  // Attach decoded user info to the request object
    next();  // Call the next middleware or route handler
  });
};

module.exports = {verifyToken};
