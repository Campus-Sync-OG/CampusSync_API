const {fee,student} = require("../models");  
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Get Fees by Admission No (Student)
exports.getFeesByAdmissionNo = async (req, res) => {
    try {
        const { admission_no } = req.params;  // Fetch admission_no from URL params

        console.log(`Fetching fees for admission_no: ${admission_no}`);  // Log admission_no
        
        // Find the student by admission_no
        const Student = await student.findOne({ where: { admission_no } });

        if (!Student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch fees associated with the student
        const fees = await fee.findAll({ where: { admission_no: Student.admission_no } });

        // Log the fees to check if they are fetched correctly
        console.log("Fetched fees:", fees);

        if (fees.length === 0) {
            return res.status(404).json({ message: "No fees found for this student" });
        }

        res.json(fees);
    } catch (error) {
        console.error("Error fetching fees:", error);
        res.status(500).json({ message: "Error fetching fees for the student" });
    }
};

// Generate and Download Fee PDF

exports.downloadFeePDF = async (req, res) => {
    try {
        // Fetch fee details using receipt_no
        const Fee = await fee.findOne({ where: { receipt_no: req.params.receipt_no } });

        if (!Fee) {
            return res.status(404).json({ message: "Fee record not found" });
        }

        // Ensure the public directory exists
        const publicDir = path.join(__dirname, '../public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true }); // Create the directory if it doesn't exist
        }

        // Define file path
        const filePath = path.join(publicDir, `receipt_${Fee.receipt_no}.pdf`);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        doc.pipe(res);

        // PDF Content
        doc.fontSize(20).text("Payment Receipt", { align: "center" }).moveDown();
        doc.fontSize(14).text(`Receipt No: ${Fee.receipt_no}`);
        doc.fontSize(14).text(`Admission No: ${Fee.admission_no}`);
        doc.fontSize(14).text(`Payment Date: ${new Date(Fee.pay_date).toLocaleDateString()}`);
        doc.fontSize(14).text(`Payment Method: ${Fee.pay_method}`);
        doc.fontSize(14).text(`Paid Amount: $${Fee.paid_amount}`);
        doc.fontSize(14).text(`Status: ${Fee.status}`);
        doc.fontSize(14).text(`Due Date: ${new Date(Fee.due_date).toLocaleDateString()}`);

        doc.end();

        // Save file path in the database 
        Fee.download_receipt = filePath;
        await Fee.save();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating PDF" });
    }
};