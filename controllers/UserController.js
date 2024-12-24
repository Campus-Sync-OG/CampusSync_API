const  User  = require('../models/users'); // Assuming User model is exported properly from models/index.js

const bcrypt = require('bcrypt');

// Utility function for error responses
const handleErrorResponse = (res, error) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error', error: error.message });
};

module.exports = {
  // Create a new user
  createUser: async (req, res) => {
    const { name, email, password, dept } = req.body;
    try {
      // Hash the password for security
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        dept,
      });

      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ message: 'Email already exists' });
      } else {
        handleErrorResponse(res, error);
      }
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }, // Exclude sensitive data
      });
      res.status(200).json(users);
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },

  // Get a single user by ID
  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },

  // Update a user
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { name, email, password, dept } = req.body;
    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedData = {
        name: name || user.name,
        email: email || user.email,
        dept: dept || user.dept,
      };

      // Hash the password only if it is provided
      if (password) {
        updatedData.password = await bcrypt.hash(password, 10);
      }

      await user.update(updatedData);

      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ message: 'Email already exists' });
      } else {
        handleErrorResponse(res, error);
      }
    }
  },

  // Delete a user
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.destroy();
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },
};
