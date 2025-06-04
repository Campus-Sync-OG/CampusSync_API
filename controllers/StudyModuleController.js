const { studymodules } = require('../models');
const path = require('path');
const fs = require('fs');
const { uploadImageToAzure, getBlobsFromContainer } = require('../services/AzureBlobService');

// Upload topic with PDF to Azure
exports.createModule = async (req, res) => {
  try {
    const { examName, subjectName, topicName } = req.body;

    if (!req.file) return res.status(400).json({ message: 'PDF file is required' });

    // Upload PDF to Azure Blob
    const metadata = { exam: examName, subject: subjectName, topic: topicName };
    const pdfUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname, 'studymodule-pdfs', metadata);

    const module = await studymodules.create({
      examName,
      subjectName,
      topicName,
      pdfUrl,
    });

    res.status(201).json(module);
  } catch (error) {
    console.error('Error uploading module:', error);
    res.status(500).json({ message: 'Failed to upload study module' });
  }
};

// Get all exams (unique)
exports.getExams = async (req, res) => {
  const exams = await studymodules.findAll({
    attributes: [[
      studymodules.sequelize.fn('DISTINCT', studymodules.sequelize.col('examName')), 'examName'
    ]]
  });
  res.json(exams.map(e => e.examName));
};

// Get subjects by exam
exports.getSubjects = async (req, res) => {
  const { examName } = req.params;
  const subjects = await studymodules.findAll({
    where: { examName },
    attributes: [[
      studymodules.sequelize.fn('DISTINCT', studymodules.sequelize.col('subjectName')), 'subjectName'
    ]]
  });
  res.json(subjects.map(s => s.subjectName));
};

// Get topics by exam & subject
exports.getTopics = async (req, res) => {
  const { examName, subjectName } = req.params;
  const topics = await studymodules.findAll({
    where: { examName, subjectName },
    attributes: ['id', 'topicName', 'pdfUrl'],
  });
  res.json(topics);
};

// Download PDF (redirect to Azure URL)
exports.downloadPDF = async (req, res) => {
  const topicName = req.params.topicName;

  try {
    const topic = await studymodules.findOne({ where: { topicName } });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Redirect to the actual PDF URL (hosted on Azure)
    res.redirect(topic.pdfUrl);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ message: 'Server error while downloading PDF' });
  }
};

exports.viewPDF = async (req, res) => {
  const topic = await studymodules.findByPk(req.params.id);
  if (!topic) return res.status(404).json({ message: 'Topic not found' });

  res.json({ url: topic.pdfUrl }); // Frontend can embed this or open in new tab
};

