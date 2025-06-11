const { fee, student } = require("../models");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_TEST_KEY_ID,
    key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

// Helper to generate receipt PDF
async function generateReceiptPdf(paymentRecord) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const receiptFileName = `Receipt_${paymentRecord.receipt_no}.pdf`;
            const receiptFilePath = path.join(__dirname, "../receipts", receiptFileName);

            // Ensure receipts folder exists
            if (!fs.existsSync(path.dirname(receiptFilePath))) {
                fs.mkdirSync(path.dirname(receiptFilePath), { recursive: true });
            }

            const stream = fs.createWriteStream(receiptFilePath);
            doc.pipe(stream);

            doc.fontSize(20).text("Fee Payment Receipt", { align: "center" });
            doc.moveDown();
            doc.fontSize(12);

            doc.text(`Receipt No: ${paymentRecord.receipt_no}`);
            doc.text(`Admission No: ${paymentRecord.admission_no}`);
            doc.text(`Name: ${paymentRecord.student_name || "N/A"}`);
            doc.text(`Class: ${paymentRecord.class_name}`);
            doc.text(`Section: ${paymentRecord.section_name}`);
            doc.text(`Payment Date: ${paymentRecord.pay_date.toISOString().split('T')[0]}`);
            doc.text(`Fee Type: ${paymentRecord.feestype}`);
            doc.text(`Amount Paid: ₹${paymentRecord.paid_amount}`);
            doc.text(`Payment Method: ${paymentRecord.pay_method}`);
            doc.text(`Status: ${paymentRecord.status}`);

            if (paymentRecord.payment_notes) {
                doc.moveDown();
                doc.text(`Notes: ${paymentRecord.payment_notes}`);
            }

            doc.end();

            stream.on("finish", () => {
                resolve(receiptFileName); // return filename or full path as needed
            });

        } catch (err) {
            reject(err);
        }
    });
}

exports.createPayment = async (req, res) => {
    try {
        const {
            pay_method,
            paid_amount,
            feestype,
            due_date,
            uniform_details,
            transport_amount,
            book_amount,
            tuition_amount,
            paid_for_items,
            payment_notes,
        } = req.body;
        const admission_no = req.params.admission_no;

        const studentdata = await student.findOne({ where: { admission_no } });
        if (!studentdata) {
            return res
                .status(404)
                .json({ error: "Student not found with this admission_no." });
        }

        const class_name = studentdata.class;
        const section_name = studentdata.section;

        // Basic validations
        if (!admission_no) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const validFeeTypes = ["Tuition", "Books", "Transport", "Uniform", "Multiple"];
        if (!validFeeTypes.includes(feestype)) {
            return res.status(400).json({ error: "Invalid feestype." });
        }

        if (feestype !== "Multiple") {
            const amounts = {
                Tuition: tuition_amount,
                Books: book_amount,
                Transport: transport_amount,
                Uniform: uniform_details ? Object.values(uniform_details).reduce((a, b) => a + b, 0) : 0,
            };

           // if (paid_amount !== amounts[feestype]) {
              //  return res.status(400).json({ error: `paid_amount must match ${feestype} amount.` });
          //  }
        } else {
            const uniformTotal = uniform_details ? Object.values(uniform_details).reduce((a, b) => a + b, 0) : 0;
            const sumAmounts = (tuition_amount || 0) + (book_amount || 0) + (transport_amount || 0) + uniformTotal;

            if (paid_amount !== sumAmounts) {
                return res.status(400).json({ error: "paid_amount must equal sum of all fee components." });
            }
        }

        // Create Razorpay order
        const amountInPaise = paid_amount * 100;
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                admission_no,
                feestype,
                class_name,
                section_name,
            },
        });

        // Generate receipt number
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const generatedReceiptNo = `REC-${dateStr}-${randomPart}`;

        // Save payment record with razorpay_order_id
        const newFee = await fee.create({
            admission_no,
            pay_date: new Date(),
            pay_method,
            paid_amount,
            receipt_no: generatedReceiptNo,
            status: "Unpaid",
            feestype,
            class_name,
            section_name,
            due_date,
            uniform_details: uniform_details || null,
            transport_amount: transport_amount || null,
            book_amount: book_amount || null,
            tuition_amount: tuition_amount || null,
            paid_for_items: paid_for_items || null,
            payment_notes: payment_notes || null,
            razorpay_order_id: razorpayOrder.id,
        });

        return res.status(201).json({
            message: "Order created successfully",
            order: razorpayOrder,
            paymentRecord: newFee,
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        // Update payment record as Paid
        const [updated] = await fee.update(
            {
                razorpay_payment_id,
                razorpay_signature,
                status: "Paid",
                pay_date: new Date(),
            },
            { where: { razorpay_order_id } }
        );

        if (!updated) {
            return res.status(404).json({ error: "Payment record not found for order id" });
        }

        // Fetch updated payment record
        const paymentRecord = await fee.findOne({ where: { razorpay_order_id } });

        // Optional: Fetch student info to add name (if needed in receipt)
        const studentRecord = await student.findOne({ where: { admission_no: paymentRecord.admission_no } });
        paymentRecord.dataValues.student_name = studentRecord ? studentRecord.name : null;

        // Generate receipt PDF
        const receiptFileName = await generateReceiptPdf(paymentRecord.dataValues);

        return res.json({
            status: "success",
            message: "Payment verified and receipt generated",
            receiptFile: `/receipts/${receiptFileName}`, // adjust URL serving logic accordingly
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Get Fees by Admission No (Student)
exports.getFeesByAdmissionNo = async (req, res) => {
    try {
        const { admission_no } = req.params;

        console.log(`Fetching fees for admission_no: ${admission_no}`);

        // Fetch all non-deleted fees for the admission number
        const fees = await fee.findAll({
            where: {
                admission_no,
                deletedAt: null,
            },
        });

        // If no fees at all, just return a message
        if (fees.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No payments present",
                data: [],
            });
        }

        // Add paid/unpaid status to each fee entry
        const enhancedFees = fees.map(f => ({
            ...f.toJSON(),
            status: f.payment_status === 'paid' ? 'Paid' : 'Unpaid',
        }));

        return res.status(200).json({
            success: true,
            data: enhancedFees,
        });
    } catch (error) {
        console.error("Error fetching fees:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching fees for the student",
        });
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
        console.log("Fetching all fee records with student info...");

        const fees = await fee.findAll({
            where: { deletedAt: null },
            include: {
                model: student,
                attributes: ["student_name", "class", "section", "admission_no"], // fields to return from student
            },
        });

        if (fees.length === 0) {
            return res.status(404).json({ message: "No fee records found" });
        }

        res.status(200).json(fees);
    } catch (error) {
        console.error("Error fetching fee records:", error);
        res.status(500).json({ message: "Failed to fetch fee records" });
    }
};
