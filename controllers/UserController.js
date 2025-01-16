const  User  = require('../models/user');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const {  unique_id, role, name, password } = req.body;

    // Validate required fields
    if (!unique_id || !role || !name || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new user
    const newUser = await User.create({
      unique_id,
      role,
      name,
      password,
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the user', error: error.message });
  }
};

// Update an existing user by unique_id
exports.updateUser = async (req, res) => {
  try {
    const { unique_id } = req.params;
    const { role, name, password } = req.body;

    // Find user by unique_id
    const user = await User.findOne({ where: { unique_id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user data
    user.role = role || user.role;
    user.name = name || user.name;
    user.password = password || user.password;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the user', error: error.message });
  }
};

// Delete a user by unique_id
exports.deleteUser = async (req, res) => {
  try {
    const { unique_id } = req.params;

    // Find user by unique_id
    const user = await User.findOne({ where: { unique_id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the user', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching users', error: error.message });
  }
};

// Get a user by unique_id
exports.getUserByUniqueId = async (req, res) => {
  try {
    const { unique_id } = req.params;

    const user = await User.findOne({ where: { unique_id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching the user', error: error.message });
  }
};
