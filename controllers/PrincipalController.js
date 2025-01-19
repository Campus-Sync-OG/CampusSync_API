const  Principal  = require('../models/principal');
const User = require('../models/user');

// Function to create a new principal
exports.createPrincipal = async (req, res) => {
  try {
    const { p_id, name, password, phone_no, email, school_name, joining_date } = req.body;

    // Ensure the User model is not undefined
    if (!User) {
      return res.status(500).json({ message: 'User model is not loaded' });
    }

    // Ensure the Principal model is not undefined
    if (!Principal) {
      return res.status(500).json({ message: 'Principal model is not loaded' });
    }

    // Check if the unique_id exists in the User table and matches the role
    const user = await User.findOne({ where: { unique_id: p_id, role: 'principal' } });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this unique_id and role principal' });
    }

    // Check if the principal is already created
    const existingPrincipal = await Principal.findOne({ where: { p_id } });
    if (existingPrincipal) {
      return res.status(400).json({ message: 'Principal with this ID already exists' });
    }

    // Create a new principal record
    const principal = await Principal.create({
      p_id,
      name,
      password,
      phone_no,
      email,
      school_name,
      joining_date,
    });

    res.status(201).json({ message: 'Principal created successfully', principal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to update the details of a principal
exports.updatePrincipal = async (req, res) => {
  try {
    const { p_id } = req.params; // Principal ID from the URL
    const updates = req.body; // Updates from the request body

    // Find the principal using p_id
    const principal = await Principal.findOne({ where: { p_id } });
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    // Update the principal's details
    await principal.update(updates);

    res.status(200).json({ message: 'Principal updated successfully', principal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to delete a principal
exports.softDeletePrincipal = async (req, res) => {
  try {
    const { p_id } = req.params;

    // Find the student by admission number
    const student = await Student.findOne({ where: { p_id } });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete the student
    await student.destroy();

    res.status(200).json({ message: 'Student soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// Function to update teacher status (active/inactive) by the principal


// Function to fetch the principal details
exports.getPrincipalDetails = async (req, res) => {
  try {
    const { p_id } = req.params;

    // Fetch details from the Principal table
    const principal = await Principal.findOne({ where: { p_id } });
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found in Principal table' });
    }

    res.status(200).json(principal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


