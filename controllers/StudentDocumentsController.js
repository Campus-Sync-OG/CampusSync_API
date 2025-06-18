const { student_documents,student } = require('../models');

// Create new document record
exports.createStudentDocument = async (req, res) => {
  try {
    const { admission_no, class: className , section, certificate_status } = req.body;
    console.log("Request Body:", req.body);

    const existing = await student_documents.findOne({
      where: { admission_no }
    });

    if (existing) {
      return res.status(400).json({ message: 'Record already exists for this student.' });
    }

    const newRecord = await student_documents.create({
      admission_no,
      class: className,
      section,
      certificate_status
    });

    res.status(201).json(newRecord);
  } catch (error) {
     console.error('Create Error:', error);
    res.status(500).json({ message: 'Error creating student document', error });
  }
};

// Get by admission_no
exports.getStudentDocumentById = async (req, res) => {
  try {
    const { admission_no } = req.params;

    const document = await student_documents.findOne({
      where: { admission_no }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error });
  }
};

// Get all documents
exports.getAllStudentDocuments = async (req, res) => {
  try {
    const documents = await student_documents.findAll({
  include: {
    model: student,
    attributes: ['student_name', 'class', 'section'],
  },
   order: [['admission_no', 'ASC']] 
});
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error });
  }
};

// Update certificate status (add new types or toggle true/false)
exports.updateStudentDocument = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const { certificate_status } = req.body;

    const studentDoc = await student_documents.findOne({
      where: { admission_no }
    });

    if (!studentDoc) {
      return res.status(404).json({ message: 'Student document not found' });
    }

    // Merge existing certificate_status with incoming
    const updatedStatus = {
      ...studentDoc.certificate_status,
      ...certificate_status
    };

    studentDoc.certificate_status = updatedStatus;
    await studentDoc.save();

    res.status(200).json({ message: 'Document updated', data: studentDoc });
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error });
  }
};
