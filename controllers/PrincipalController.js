const bcrypt = require('bcrypt'); // For password hashing
const Principal = require('../models/principal');

// Create a new principal
exports.createPrincipal = async (req, res) => {
  try {
    const { emp_id, name, password, phone_no, email, school_name, add_teacher } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPrincipal = await Principal.create({
      emp_id,
      name,
      password: hashedPassword,
      phone_no,
      email,
      school_name,
      add_teacher,
    });

    res.status(201).json({ message: 'Principal created successfully', principal: newPrincipal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all principals
exports.getAllPrincipals = async (req, res) => {
  try {
    const principals = await Principal.findAll();
    res.status(200).json(principals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a principal by emp_id
exports.getPrincipalByEmpId = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const principal = await Principal.findOne({ where: { emp_id } });

    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    res.status(200).json(principal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a principal by emp_id
exports.updatePrincipalByEmpId = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { name, password, phone_no, email, school_name, add_teacher } = req.body;

    const principal = await Principal.findOne({ where: { emp_id } });
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    if (password) {
      // Hash the new password if provided
      principal.password = await bcrypt.hash(password, 10);
    }

    // Update other fields
    principal.name = name || principal.name;
    principal.phone_no = phone_no || principal.phone_no;
    principal.email = email || principal.email;
    principal.school_name = school_name || principal.school_name;
    principal.add_teacher = add_teacher !== undefined ? add_teacher : principal.add_teacher;

    await principal.save();

    res.status(200).json({ message: 'Principal updated successfully', principal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a principal by emp_id
exports.deletePrincipalByEmpId = async (req, res) => {
  try {
    const { emp_id } = req.params;

    const principal = await Principal.findOne({ where: { emp_id } });
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    await principal.destroy();
    res.status(200).json({ message: 'Principal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
