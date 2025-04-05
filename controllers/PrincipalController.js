const { principal, user, subject ,feedback} = require('../models');

exports.createPrincipal = async (req, res) => {
  try {
    const { p_id, name, password, phone_no, email, school_name, joining_date } = req.body;

    // Check if the `user` model exists and validate the principal's unique ID
    const matchingUser = await user.findOne({ where: { unique_id: p_id, role: 'principal' } });
    if (!matchingUser) {
      return res.status(400).json({ message: 'No user found with this unique_id and role principal' });
    }

    // Check if the principal is already created
    const existingPrincipal = await principal.findOne({ where: { p_id } });
    if (existingPrincipal) {
      return res.status(400).json({ message: 'Principal with this ID already exists' });
    }

    // Create a new principal record
    const newPrincipal = await principal.create({
      p_id,
      name,
      password,
      phone_no,
      email,
      school_name,
      joining_date,
    });

    res.status(201).json({ message: 'Principal created successfully', principal: newPrincipal });
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
exports.createSubject = async (req, res) => {
  try {
    const { p_id } = req.params;
    // If you're using POST, you may prefer req.body over req.query.
    const { subject_name } = req.query;
    // const { subject_name } = req.body; // Uncomment if using req.body

    if (!subject_name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const foundPrincipal = await findPrincipalById(p_id, res);
    if (!foundPrincipal) return;

    // Create the subject
    const newSubject = await subject.create({ subject_name });
    return res.status(201).json({
      message: "Subject created successfully",
      subject: newSubject,
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name } = req.query;

    if (!subject_name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const foundSubject = await subject.findByPk(id);
    if (!foundSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Update subject name
    await foundSubject.update({ subject_name });
    return res.status(200).json({
      message: "Subject updated successfully",
      subject: foundSubject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getAllFeedback = async (req, res) => {
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