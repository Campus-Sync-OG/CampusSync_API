const { academics, student } = require('../models');
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize"); // ✅ Fix: import Sequelize Op
const puppeteer = require("puppeteer");

// Get all academic records
const getAllAcademics = async (req, res) => {
  try {
    const academic = await academics.findAll();
    res.status(200).json(academic);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve academic records" });
  }
};

// Get academic record by admission_no
const getAcademicById = async (req, res) => {
  try {
    const { admission_no } = req.params;

    const academicRecords = await academics.findAll({
      where: { admission_no } // Fetch all academic records related to this admission_no
    });

    if (!academicRecords || academicRecords.length === 0) {
      return res.status(404).json({ error: "No academic records found for this admission number" });
    }

    res.status(200).json(academicRecords);
  } catch (error) {
    console.error("Error fetching academic records:", error);
    res.status(500).json({ error: "Failed to retrieve academic records", details: error.message });
  }
};

const deleteAcademicById = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const deleted = await academics.destroy({ where: { admission_no } });

    if (!deleted) {
      return res.status(404).json({ error: "No academic records found for this admission number" });
    }

    res.status(200).json({ message: "Academic records deleted successfully" });
  } catch (error) {
    console.error("Error deleting academic record:", error);
    res.status(500).json({ error: "Failed to delete academic record", details: error.message });
  }
};

async function generateMarksheetPdf(markData) {
  const templatePath = path.join(__dirname, "../templates/marksheetTemplate.html");
  const fileName = `Marksheet_${markData.admission_no}_${Date.now()}.pdf`;
  const marksheetPath = path.join(__dirname, "../marksheets", fileName);

  const html = fs.readFileSync(templatePath, "utf8");
  const filledHtml = html.replace(/{{(.*?)}}/g, (_, key) =>
    (markData[key.trim()] || "").toString()
  );

  if (!fs.existsSync(path.dirname(marksheetPath))) {
    fs.mkdirSync(path.dirname(marksheetPath), { recursive: true });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(filledHtml, { waitUntil: "load" });

  await page.pdf({
    path: marksheetPath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return fileName;
}

const generateMarksheet = async (req, res) => {
  try {
    const { admission_no, exam_format } =  req.params;

    if (!admission_no || !exam_format) {
      return res.status(400).json({ message: "admission_no and exam_format are required" });
    }

    const studentData = await student.findOne({ where: { admission_no } });
    if (!studentData) {
      return res.status(404).json({ message: "Student not found for this admission_no" });
    }

    const academicRecords = await academics.findAll({
      where: { admission_no, exam_format },
      order: [["subjects", "ASC"]]
    });

    if (!academicRecords || academicRecords.length === 0) {
      return res.status(404).json({ message: "No academic records found for this admission_no and exam_format" });
    }

    // Calculate summary
    let totalMarks = 0;
    let maxMarks = 0;
    const subjectsHtml = academicRecords.map(rec => {
      totalMarks += rec.marks_obtained;
      maxMarks += rec.total_marks;

      const percent = (rec.marks_obtained / rec.total_marks) * 100;
      let grade = "D";
      if (percent >= 90) grade = "A+";
      else if (percent >= 80) grade = "A";
      else if (percent >= 70) grade = "B+";
      else if (percent >= 60) grade = "B";
      else if (percent >= 50) grade = "C";

      return `
        <tr>
          <td>${rec.subjects}</td>
          <td>${rec.total_marks}</td>
          <td>${rec.marks_obtained}</td>
          <td>${grade}</td>
        </tr>`;
    }).join("");

    const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
    const overallGrade = percentage >= 90 ? "A+" :
                         percentage >= 80 ? "A" :
                         percentage >= 70 ? "B+" :
                         percentage >= 60 ? "B" :
                         percentage >= 50 ? "C" : "D";
    const remarks = percentage >= 80 ? "Excellent performance. Keep it up!" : "Needs Improvement.";

    const markData = {
      student_name: studentData.student_name,
      admission_no: studentData.admission_no,
      roll_number: studentData.roll_number || "N/A",
      class_grade: academicRecords[0].class_grade,
      academic_year: academicRecords[0].academic_year,
      dob: studentData.dob,
      exam_format: academicRecords[0].exam_format,
      issue_date: new Date().toLocaleDateString(),
      subjects_table: subjectsHtml,
      total_marks: `${totalMarks} / ${maxMarks}`,
      percentage,
      result: percentage >= 35 ? "PASSED" : "FAILED",
      overall_grade: overallGrade,
      remarks
    };

    const fileName = await generateMarksheetPdf(markData);
    const filePath = `${req.protocol}://${req.get("host")}/marksheets/${fileName}`;

    res.status(200).json({ success: true, marksheetUrl: filePath });

  } catch (err) {
    console.error("Marksheet generation error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getAllAcademics, getAcademicById, deleteAcademicById, generateMarksheet };





