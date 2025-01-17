const User = require('../models/user');

// Controller methods
const userController = {
  // Create a new user
  createUser: async (req, res) => {
    const { role, name, password } = req.body;
    try {
      const newUser = await User.create({ role, name, password });
      res.status(201).json({
        message: 'User created successfully',
        user: newUser,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error creating user',
        error: error.message,
      });
    }
  },

  // Get all users or filter by role
  getAllUsers: async (req, res) => {
    const { role } = req.query;
    try {
      const whereClause = role ? { role } : {};
      const users = await User.findAll({ where: whereClause });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving users',
        error: error.message,
      });
    }
  },

  // Get a user by unique_id
  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving user',
        error: error.message,
      });
    }
  },

  // Update a user by unique_id
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { role, name, password } = req.body;
    try {
      const user = await User.findByPk(id);
      if (user) {
        await user.update({ role, name, password });
        res.status(200).json({
          message: 'User updated successfully',
          user,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error updating user',
        error: error.message,
      });
    }
  },

  // Delete a user by unique_id
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (user) {
        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting user',
        error: error.message,
      });
    }
  },
};

module.exports = userController;
