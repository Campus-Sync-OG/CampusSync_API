const {fee,student} = require("../models");  
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Get Fees by Admission No (Student)
exports.getFeesByAdmissionNo = async (req, res) => {
    try {
        const { admission_no } = req.params;  // Get admission_no from request params

        console.log(`Fetching fees for admission_no: ${admission_no}`);  // Log for debugging
        
        // Fetch fees directly without needing to query Student first
        const fees = await fee.findAll({ 
            where: { 
                admission_no,
                deletedAt: null // Ensure soft-deleted fees are not included
            }
        });

        // Log fetched fees
        console.log("Fetched fees:", fees);

        if (fees.length === 0) {
            return res.status(404).json({ success: false, message: "No fees found for this student" });
        }

        return res.status(200).json({ success: true, data: fees });

    } catch (error) {
        console.error("Error fetching fees:", error);
        return res.status(500).json({ success: false, message: "Error fetching fees for the student" });
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
exports.deleteFee = async (req, res) => {
    try {
        const { admission_no } = req.params;  // Fetch admission_no from URL params

        // Find all fee records for the admission_no
        const fees = await fee.findAll({ where: { admission_no } });
        if (fees.length === 0) {
            return res.status(404).json({ message: "No fee records found for this admission number" });
        }

        // Soft delete all records by updating 'deleted_at' field
        await fee.update(
            { deletedAt: new Date() },
            { where: { admission_no } }
        );

        console.log(`All fee records for Admission No: ${admission_no} marked as deleted.`);  // Log soft delete success

        res.status(200).json({ message: "All fee records deleted successfully" });
    } catch (error) {
        console.error("Error deleting fee records:", error);
        res.status(500).json({ message: "Failed to delete fee records" });
    }
};


exports.getAllFees = async (req, res) => {
    try {
        console.log("Fetching all fee records (excluding deleted ones)..."); // Log action

        // Fetch all fee records excluding soft-deleted ones
        const fees = await fee.findAll({ where: { deletedAt: null } });

        console.log("Fetched fees:", fees); // Log retrieved records

        if (fees.length === 0) {
            return res.status(404).json({ message: "No fee records found" });
        }

        res.status(200).json(fees);
    } catch (error) {
        console.error("Error fetching fee records:", error);
        res.status(500).json({ message: "Failed to fetch fee records" });
    }
};
