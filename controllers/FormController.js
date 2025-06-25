const { forms } = require("../models");

const createForm = async (req, res) => {
  try {
    const { title, startDate, endDate, link, status } = req.body;

    if (!title || !link || !startDate || !endDate || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newForm = await forms.create({
      title,
      link,
      start_date: startDate,
      end_date: endDate,
      status,
    });

    return res.status(201).json({
      message: "Form created successfully",
      form: newForm,
    });
  } catch (error) {
    console.error("Error creating form:", error.message || error);
    return res.status(500).json({ message: "Internal server error", error: error.message || error });
  }
};


const updateForm = async (req, res) => {
  try {
    const { title } = req.params;
    const { date, link } = req.body;

    const form = await forms.findOne({ where: { title } });
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    await form.update({ date, link });
    return res.status(200).json({ message: "Form updated successfully", form });
  } catch (error) {
    console.error("Error updating form:", error);
    return res.status(500).json({ message: "Error updating form", error });
  }
};

const getFormByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    const form = await forms.findOne({ where: { title } });
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    return res.status(200).json({ form });
  } catch (error) {
    console.error("Error fetching form:", error);
    return res.status(500).json({ message: "Error fetching form", error });
  }
};

const getAllForms = async (req, res) => {
  try {
    const allForms = await forms.findAll();
    return res.status(200).json({ forms: allForms });
  } catch (error) {
    console.error("Error fetching all forms:", error);
    return res.status(500).json({ message: "Error fetching all forms", error });
  }
};

const deleteForm = async (req, res) => {
  try {
    const formId = req.params.id;

    const form = await forms.findByPk(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    await form.destroy(); // permanently delete

    return res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || error,
    });
  }
};


module.exports = { createForm, updateForm, getFormByTitle, getAllForms,deleteForm };
