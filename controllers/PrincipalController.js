const { principal, user ,feedback,teacher_subject} = require('../models');

exports.createPrincipal = async (req, res) => {
  try {
    const { p_id, name, password, phone_no, email, joining_date } = req.body;

    if (!p_id || !name || !password || !joining_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if a principal already exists in the system
    const existingPrincipal = await principal.findOne();
    if (existingPrincipal) {
      return res.status(400).json({ message: 'A principal already exists. Please remove the existing principal before adding a new one.' });
    }

    // Check if user exists with this ID and role
    const matchingUser = await user.findOne({ where: { unique_id: p_id, role: 'principal' } });
    if (!matchingUser) {
      return res.status(400).json({ message: 'No user found with this unique_id and role principal' });
    }

    const newPrincipal = await principal.create({
      p_id,
      name,
      password,
      phone_no,
      email,
      joining_date,
    });

    res.status(201).json({ message: 'Principal created successfully', principal: newPrincipal });
  } catch (error) {
    console.error('Error creating principal:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


// Function to update the details of a principal
exports.updatePrincipal = async (req, res) => {
  try {
    const { p_id } = req.params; // Principal ID from the URL
    const updates = req.body; // Updates from the request body

    // Find the principal using p_id
    const existingPrincipal = await principal.findOne({ where: { p_id } });
    if (!existingPrincipal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    // Update the principal's details
    await existingPrincipal.update(updates);

    res.status(200).json({ message: 'Principal updated successfully', principal: existingPrincipal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to delete a principal
exports.softDeletePrincipal = async (req, res) => {
  try {
    const { p_id } = req.params;

    // Find the principal by p_id
    const existingPrincipal = await principal.findOne({ where: { p_id } });

    if (!existingPrincipal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    // Soft delete the principal (if you mean marking as inactive)
    await existingPrincipal.update({ is_active: false });

    res.status(200).json({ message: 'Principal soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to fetch the principal details
exports.getPrincipalDetails = async (req, res) => {
  try {
    const { p_id } = req.params;

    // Fetch details from the principal table
    const existingPrincipal = await principal.findOne({ where: { p_id } });
    if (!existingPrincipal) {
      return res.status(404).json({ message: 'Principal not found in Principal table' });
    }

    res.status(200).json(existingPrincipal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const findPrincipalById = async (p_id, res) => {
  const foundPrincipal = await principal.findOne({ where: { p_id } });
  if (!foundPrincipal) {
    res.status(404).json({ message: "Principal not found" });
    return null;
  }
  return foundPrincipal;
};

exports.getAllFeedback = async (req, res) => {
  console.log("Fetching all feedbacks...");
  try {
    const feedbacks = await feedback.findAll({
      attributes: ["id","message"], // No sender info
    });

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ message: "Error retrieving feedback", error: error.message });
  }
};


exports.getAllAssignedSubjectToTeacher= async (req, res) => {
  try {
    const assignments = await teacher_subject.findAll();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};