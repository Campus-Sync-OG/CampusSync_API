const User = require('../models/user');

const userController = {
  createUser: async (req, res) => {
    const { role, name, password,status } = req.body;

    try {
      const newUser = await User.create({ role, name, password,status });
      res.status(201).json({
        message: 'User created successfully',
        user: newUser,
      });
    } catch (error) {
      console.error('Error creating user:', error.message);
      res.status(500).json({
        message: 'Error creating user',
        error: error.message,
      });
    }
  },

  getAllUsers: async (req, res) => {
    const { role } = req.query;

    try {
      const whereClause = role ? { role } : {};
      const users = await User.findAll({ where: whereClause });

      res.status(200).json(users);
    } catch (error) {
      console.error('Error retrieving users:', error.message);
      res.status(500).json({
        message: 'Error retrieving users',
        error: error.message,
      });
    }
  },

  getUserByUniqueId: async (req, res) => {
    const { unique_id } = req.params;

    try {
      if (!unique_id || typeof unique_id !== 'string') {
        return res.status(400).json({ message: 'Invalid unique_id provided' });
      }

      const user = await User.findOne({
        where: { unique_id: unique_id.trim() }, // Trim to avoid extra spaces
      });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user:', error.message);
      res.status(500).json({
        message: 'Error retrieving user',
        error: error.message,
      });
    }
  },

  updateUser: async (req, res) => {
    const { unique_id } = req.params;
    const { role, name, password,status } = req.body;

    try {
      if (!unique_id || typeof unique_id !== 'string') {
        return res.status(400).json({ message: 'Invalid unique_id provided' });
      }

      const user = await User.findOne({
        where: { unique_id: unique_id.trim() },
      });

      if (user) {
        await user.update({ role, name, password,status });
        res.status(200).json({
          message: 'User updated successfully',
          user,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
      res.status(500).json({
        message: 'Error updating user',
        error: error.message,
      });
    }
  },

  deleteUser: async (req, res) => {
    const { unique_id } = req.params;

    try {
      if (!unique_id || typeof unique_id !== 'string') {
        return res.status(400).json({ message: 'Invalid unique_id provided' });
      }

      const user = await User.findOne({
        where: { unique_id: unique_id.trim() },
      });

      if (user) {
        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
      res.status(500).json({
        message: 'Error deleting user',
        error: error.message,
      });
    }
  },
};

module.exports = userController;
