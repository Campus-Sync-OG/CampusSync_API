const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users'); // Assuming the User model is imported correctly
const { JWT_SECRET } = require('../config/config'); // Your JWT secret stored in config

// Utility function for error responses
const handleErrorResponse = (res, error) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error', error: error.message });
};

module.exports = {
  // User login (Generate JWT token)
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, uname: user.uname }, // Payload
        JWT_SECRET, // Secret key for encoding the JWT
        { expiresIn: '1h' } // Token expiration time (1 hour)
      );

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },

  // Middleware to authenticate user using JWT token
  authenticate: async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user information to the request object
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  },

  // Middleware to check if user is an admin (for admin-only routes)
  isAdmin: async (req, res, next) => {
    try {
      // Check user role, assuming 'admin' role is assigned to admin users
      const user = await User.findByPk(req.user.id);

      if (user && user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Access denied: Admins only' });
      }
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },
};
