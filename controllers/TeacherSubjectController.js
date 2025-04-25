// controllers/assignmentController.js

const { teacher_subject } = require('../models');

module.exports = {
  async create(req, res) {
    try {
      const { teacher_id, class_name, section, subject_name } = req.body;
      const assignment = await teacher_subject.create({ teacher_id, class_name, section, subject_name });
      res.status(201).json(assignment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const assignments = await teacher_subject.findAll();
      res.json(assignments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getByTeacher(req, res) {
    try {
      const { teacher_id } = req.params;
      const assignments = await teacher_subject.findAll({ where: { teacher_id } });
      res.json(assignments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await Assignment.destroy({ where: { id } });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
