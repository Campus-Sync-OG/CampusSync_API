const Users = require('../models/users'); // Correct import based on model name

exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await Users.findAll();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { user_id: req.params.id } // Use 'user_id' to match your column name
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await Users.create(req.params);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const [updated] = await Users.update(req.body, {
      where: { user_id: req.params.id } // Use 'user_id' to match your column name
    });
    if (updated) {
      const updatedUser = await Users.findOne({
        where: { user_id: req.params.id }
      });
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [updated] = await Users.update(
      { status: 'inactive' }, // Set status to 'inactive'
      { where: { user_id: req.params.id } }
    );

    if (updated) {
      res.status(200).json({ message: "User marked as inactive successfully" });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
