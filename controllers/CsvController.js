const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const { assignment, academics, teacher, examformat, fee, student } = require("../models");
const moment = require("moment");  // Using moment.js for date parsing

// Multer Storage Configuration
const upload = multer({ dest: "uploads/" });

const processCSV = async (filePath, model, res, type) => {
  const records = [];

  const processRows = new Promise((resolve, reject) => {
    const promises = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (headers) => {
        console.log("CSV Headers:", headers);  // Debugging headers to check column names
      })
      .on("data", (row) => {
        console.log("Raw CSV Row:", JSON.stringify(row, null, 2)); // Debugging

        promises.push(
          (async () => {
            try {
              // Extract subject key dynamically
              let subjectKey = Object.keys(row).find((key) =>
                key.toLowerCase().includes("subject")
              );
              let subject = subjectKey ? row[subjectKey] : "Unknown";

              // Extract teacher name using emp_id
              let teacher_name = "Unknown";
              if (row.emp_id) {
                const teacherRecord = await teacher.findOne({ where: { emp_id: row.emp_id } });
                if (teacherRecord) teacher_name = teacherRecord.emp_name;
              }

              // Handle Date Parsing (using moment.js)
              let formattedDate = null;
              let rawDate = row.exam_date || row.Date || row.DATE;
              console.log("Raw Date Field:", rawDate);  // Log the raw date

              if (rawDate) {
                // Try parsing the date using moment.js (supports multiple formats)
                formattedDate = moment(rawDate, ["DD-MM-YYYY", "MM/DD/YYYY", "DD/MM/YYYY"]).isValid()
                  ? moment(rawDate).format("YYYY-MM-DD")
                  : null;
              }

              if (!formattedDate) {
                console.warn(`Invalid or unsupported date format for exam_date: ${rawDate}`);
              }

              // Ensure `admission_no` is properly extracted
              let admissionNo = Object.keys(row).find(key =>
                key.toLowerCase().includes("admission_no")
              );
              admissionNo = admissionNo ? row[admissionNo].trim() : null;

              // Construct record object based on type
              let record = {};
              if (type === "assignment") {
                record = {
                  subjects: subject.trim(),
                  title: row.title || "Untitled",
                  admission_no: admissionNo,
                  emp_id: row.emp_id || null,
                  emp_name: teacher_name,
                  Date: formattedDate,
                  attachment: row.attachment || null,
                };
              } else if (type === "academics") {
                // Fetch exam_format from the examformat table based on exam_name
                let exam_format = "Unknown";
                if (row.exam_format) {
                  const examRecord = await examformat.findOne({ where: { exam_name: row.exam_format } });
                  if (examRecord) exam_format = examRecord.exam_name;
                }

                record = {
                  admission_no: admissionNo,
                  subjects: subject.trim(),
                  class_grade: row.class_grade || "Unknown",
                  exam_format: exam_format,  // Updated to fetch from examformat table
                  academic_year: row.academic_year || "Unknown",
                  marks_obtained: row.marks_obtained || 0,
                  total_marks: row.total_marks || 0,
                  exam_date: formattedDate,
                };
              } else if (type === "fee") {
                // Ensure required fields are present
                if (!row.admission_no || !row.receipt_no || !row.paid_amount) {
                  console.warn(`Skipping fee record due to missing fields: ${JSON.stringify(row)}`);
                  return;
                }

                // Check if student exists
                const existingStudent = await student.findOne({
                  where: { admission_no: row.admission_no.trim() },
                });

                if (!existingStudent) {
                  console.warn(`Skipping fee record. Student not found for admission_no: ${row.admission_no}`);
                  return;
                }

                // Parse Dates (Only Pay Date and Due Date)
                let formattedPayDate = null;
                let formattedDueDate = null;

                let rawPayDate = row.pay_date ? row.pay_date.toString().trim() : null;
                let rawDueDate = row.due_date ? row.due_date.toString().trim() : null;

                if (rawPayDate) {
                  let parsedPayDate = moment(rawPayDate, ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY"], true);
                  if (parsedPayDate.isValid()) {
                    formattedPayDate = parsedPayDate.format("YYYY-MM-DD");
                  } else {
                    console.warn(`Invalid date format for pay_date: ${rawPayDate}`);
                  }
                } else {
                  console.warn("Missing pay_date in CSV row.");
                }

                if (rawDueDate) {
                  let parsedDueDate = moment(rawDueDate, ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY"], true);
                  if (parsedDueDate.isValid()) {
                    formattedDueDate = parsedDueDate.format("YYYY-MM-DD");
                  } else {
                    console.warn(`Invalid date format for due_date: ${rawDueDate}`);
                  }
                } else {
                  console.warn("Missing due_date in CSV row.");
                }

                // Construct Fee Record (No Exam Date!)
                record = {
                  admission_no: row.admission_no.trim(),
                  pay_date: formattedPayDate,
                  pay_method: row.pay_method || "Unknown",
                  paid_amount: parseFloat(row.paid_amount) || 0,
                  receipt_no: row.receipt_no.trim(),
                  status: row.status || "unpaid",
                  due_date: formattedDueDate,
                };
              }
              console.log("Processed Record:", record); // Debugging

              // Ensure `admission_no` is not null or empty before adding to records
              if (admissionNo !== null && admissionNo !== "") {
                records.push(record);
              } else {
                console.warn("Skipping record due to missing admission_no:", record);
              }
            } catch (error) {
              console.error("Error processing row:", error);
            }
          })()
        );
      })
      .on("end", async () => {
        try {
          await Promise.all(promises);
          console.log("Final Records to Insert:", records);
          if (records.length > 0) {
            await model.bulkCreate(records);
          } else {
            console.warn("No valid records to insert.");
          }
          fs.unlinkSync(filePath);
          res.status(200).json({ message: `${type} CSV uploaded and processed successfully` });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => reject(error));
  });

  try {
    await processRows;
  } catch (error) {
    console.error("Error inserting into DB:", error);
    res.status(500).json({ message: "Error inserting data", error });
  }
};

// Route Handlers
const uploadAssignmentsCSV = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  processCSV(req.file.path, assignment, res, "assignment");
};

const uploadAcademicsCSV = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  processCSV(req.file.path, academics, res, "academics");
};
const uploadFeesCSV = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  processCSV(req.file.path, fee, res, "fee");
};

module.exports = {
  uploadAssignmentsCSV,
  uploadAcademicsCSV,
  uploadFeesCSV,
  upload,
};
