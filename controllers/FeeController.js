const { fee, student, fee_plan } = require("../models");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Op } = require("sequelize"); // ✅ Fix: import Sequelize Op
const puppeteer = require("puppeteer");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY_ID,
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

// Helper to generate receipt PDF
async function generateReceiptPdf(feeRecord) {
  const receiptNo = feeRecord.receipt_no || `REC-${Date.now()}`;
  const templatePath = path.join(
    __dirname,
    "../templates/receiptTemplate.html"
  );
  const fileName = `Receipt_${receiptNo}.pdf`;
  const receiptPath = path.join(__dirname, "../receipts", fileName);

  const html = fs.readFileSync(templatePath, "utf8");
  const filledHtml = html.replace(/{{(.*?)}}/g, (_, key) =>
    (feeRecord[key.trim()] || "").toString()
  );

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(filledHtml, { waitUntil: "load" });

  if (!fs.existsSync(path.dirname(receiptPath))) {
    fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  }

  await page.pdf({
    path: receiptPath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return fileName;
}

// ✅ Receipt Controller
exports.generateReceipt = async (req, res) => {
  try {
    const { admission_no, feestype } = req.body;

    if (!admission_no || !feestype) {
      return res
        .status(400)
        .json({ message: "admission_no and feestype are required" });
    }

    // Fetch the latest paid fee record
    const feeRecord = await fee.findOne({
      where: {
        admission_no,
        feestype,
        paid_amount: { [Op.gt]: 0 },
      },
      order: [["pay_date", "DESC"]],
    });

    if (!feeRecord) {
      return res
        .status(404)
        .json({ message: "No payment found for receipt generation" });
    }

    // Fetch student record for name
    const studentData = await student.findOne({
      where: { admission_no }
    });

    if (!studentData) {
      return res
        .status(404)
        .json({ message: "Student not found for this admission_no" });
    }

    // Attach student name to feeRecord (for template fill)
    const feeRecordWithName = {
      ...feeRecord.toJSON(),
      student_name: studentData.student_name
    };

    const fileName = await generateReceiptPdf(feeRecordWithName);
    const filePath = `${req.protocol}://${req.get("host")}/receipts/${fileName}`;

    res.status(200).json({ success: true, receiptUrl: filePath });
  } catch (err) {
    console.error("Receipt generation error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

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
      return res.status(404).json({ error: "Student not found with this admission_no." });
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
      // Optional: Validate amounts for single fee type
    } else {
      const uniformTotal = uniform_details
        ? Object.values(uniform_details).reduce((a, b) => a + b, 0)
        : 0;
      const sumAmounts =
        (tuition_amount || 0) +
        (book_amount || 0) +
        (transport_amount || 0) +
        uniformTotal;

      if (paid_amount !== sumAmounts) {
        return res.status(400).json({
          error: "paid_amount must equal sum of all fee components.",
        });
      }
    }

    // Generate receipt number
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const generatedReceiptNo = `REC-${dateStr}-${randomPart}`;

    if (pay_method === "Cash") {
      // Directly create fee record and generate receipt
      const newFee = await fee.create({
        admission_no,
        pay_date: new Date(),
        pay_method,
        paid_amount,
        receipt_no: generatedReceiptNo,
        status: "Paid",
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
      });

      return res.status(201).json({
        message: "Cash payment recorded successfully",
        receipt: {
          receipt_no: newFee.receipt_no,
          admission_no: newFee.admission_no,
          student_name: studentdata.student_name,
          class_name: newFee.class_name,
          section_name: newFee.section_name,
          feestype: newFee.feestype,
          paid_amount: newFee.paid_amount,
          pay_method: newFee.pay_method,
          pay_date: new Date(newFee.pay_date),

        }
      });
    }

    // If not cash → Razorpay order flow
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
      message: "Online order created successfully",
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

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
      return res
        .status(404)
        .json({ error: "Payment record not found for order id" });
    }

    // Fetch updated payment record
    const paymentRecord = await fee.findOne({ where: { razorpay_order_id } });

    // Optional: Fetch student info to add name (if needed in receipt)
    const studentRecord = await student.findOne({
      where: { admission_no: paymentRecord.admission_no },
    });
    paymentRecord.dataValues.student_name = studentRecord
      ? studentRecord.name
      : null;

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
    const enhancedFees = fees.map((f) => ({
      ...f.toJSON(),
      status: f.payment_status === "paid" ? "Paid" : "Unpaid",
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
    const Fee = await fee.findOne({
      where: { receipt_no: req.params.receipt_no },
    });

    if (!Fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    // Ensure the public directory exists
    const publicDir = path.join(__dirname, "../public");
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
    doc
      .fontSize(14)
      .text(`Payment Date: ${new Date(Fee.pay_date).toLocaleDateString()}`);
    doc.fontSize(14).text(`Payment Method: ${Fee.pay_method}`);
    doc.fontSize(14).text(`Paid Amount: $${Fee.paid_amount}`);
    doc.fontSize(14).text(`Status: ${Fee.status}`);
    doc
      .fontSize(14)
      .text(`Due Date: ${new Date(Fee.due_date).toLocaleDateString()}`);

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
    const { admission_no } = req.params; // Fetch admission_no from URL params

    // Find all fee records for the admission_no
    const fees = await fee.findAll({ where: { admission_no } });
    if (fees.length === 0) {
      return res
        .status(404)
        .json({ message: "No fee records found for this admission number" });
    }

    // Soft delete all records by updating 'deleted_at' field
    await fee.update({ deletedAt: new Date() }, { where: { admission_no } });

    console.log(
      `All fee records for Admission No: ${admission_no} marked as deleted.`
    ); // Log soft delete success

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


exports.createFeePlanForClassSection = async (req, res) => {
  try {
    const {
      class_name,
      section_name,
      feestype,
      total_fee,
      due_date,
      notes,
      items // dynamic items array
    } = req.body;

    if (!class_name || !section_name || !feestype || !total_fee || !due_date) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (
      (feestype.toLowerCase() === 'uniform' || feestype.toLowerCase() === 'books') &&
      (!items || !Array.isArray(items) || items.length === 0)
    ) {
      return res.status(400).json({ error: "Items are required for uniform/books fee type." });
    }

    // Fetch all students for this class + section
    const students = await student.findAll({
      where: {
        class: class_name.trim(),
        section: section_name.trim()
      }
    });

    if (students.length === 0) {
      return res.status(404).json({ error: "No students found for this class and section." });
    }

    // Delete existing fee plans for this class + section + feestype
    await fee_plan.destroy({
      where: {
        class_name: class_name.trim(),
        section_name: section_name.trim(),
        feestype
      }
    });

    // Create fee plan for each student
    const plans = await Promise.all(
      students.map(stu => {
        const feeData = {
          class_name: class_name.trim(),
          section_name: section_name.trim(),
          admission_no: stu.admission_no,
          feestype,
          total_fee,
          due_date,
          notes: notes || null,
          item_details: items ? JSON.stringify(items) : null
        };

        return fee_plan.create(feeData);
      })
    );

    res.status(201).json({
      success: true,
      message: `${plans.length} fee plans created successfully (replaced any existing plans).`,
      data: plans
    });

  } catch (err) {
    console.error("Error creating fee plans:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getFeeStatusByClassSection = async (req, res) => {
  try {
    const { class_name, section_name, feestype } = req.query;

    if (!class_name || !section_name || !feestype) {
      return res.status(400).json({ error: "class_name, section_name, and feestype are required in query." });
    }

    // ✅ Get students in class + section
    const students = await student.findAll({
      where: {
        class: class_name,
        section: section_name
      }
    });

    if (students.length === 0) {
      return res.status(404).json({ error: "No students found for this class and section." });
    }

    const admissionNos = students.map(s => s.admission_no);

    // ✅ Get fee plans for these students
    const plans = await fee_plan.findAll({
      where: {
        admission_no: { [Op.in]: admissionNos },
        feestype,

      }
    });

    if (plans.length === 0) {
      return res.status(404).json({ error: "No fee plans found for this class/section and feestype." });
    }

    // ✅ Get all fee payments for these students
    const payments = await fee.findAll({
      where: {
        admission_no: { [Op.in]: admissionNos },
        feestype,
        status: "Paid",
      }
    });

    // ✅ Process: build report
    const report = plans.map(plan => {
      const paid = payments
        .filter(p => p.admission_no === plan.admission_no)
        .reduce((sum, p) => sum + p.paid_amount, 0);

      return {
        admission_no: plan.admission_no,
        total_fee: plan.total_fee,
        paid_amount: paid,
        due_amount: plan.total_fee - paid,
        due_date: plan.due_date
      };
    });

    // ✅ Count paid / due
    const paidCount = report.filter(r => r.paid_amount >= r.total_fee).length;
    const dueCount = report.length - paidCount;

    res.status(200).json({
      success: true,
      class_name,
      section_name,
      feestype,
      total_students: report.length,
      paid_count: paidCount,
      due_count: dueCount,
      details: report
    });

  } catch (err) {
    console.error("Error getting fee status summary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.recordCashPayment = async (req, res) => {
  try {
    const {
      admission_no,
      feestype,
      paid_amount,
      payment_date,  // could default to NOW if not provided
      notes
    } = req.body;

    if (!admission_no || !feestype || !paid_amount) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // You can generate receipt number like: CASH-20250618-001
    const receipt_no = `CASH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const feePayment = await fee.create({
      admission_no,
      feestype,
      paid_amount,
      payment_mode: "cash",
      receipt_no,
      payment_date: payment_date || new Date(),
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      message: "Cash payment recorded successfully.",
      data: feePayment
    });

  } catch (err) {
    console.error("Error recording cash payment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getStudentFeeStatus = async (req, res) => {
  try {
    const { admission_no } = req.params;

    if (!admission_no) {
      return res.status(400).json({ error: "admission_no is required" });
    }

    const feePlans = await fee_plan.findAll({
      where: { admission_no }
    });

    if (feePlans.length === 0) {
      return res.status(404).json({ error: "No fee plans found for this student." });
    }

    const feePayments = await fee.findAll({
      where: { admission_no, deletedAt: null }
    });

    // 👉 Here’s your updated mapping with parsed item_details
    const statusList = feePlans.map(plan => {
      const paidForType = feePayments
        .filter(p => p.feestype === plan.feestype)
        .reduce((sum, p) => sum + p.paid_amount, 0);

      let itemDetails = null;
      if (plan.item_details) {
        try {
          itemDetails = JSON.parse(plan.item_details);
        } catch (e) {
          console.error("Invalid item_details JSON", e);
          itemDetails = [];
        }
      }

      return {
        feestype: plan.feestype,
        total_fee: plan.total_fee,
        due_amount: plan.total_fee - paidForType,
        paid_amount: paidForType,
        due_date: plan.due_date,
        notes: plan.notes,
        item_details: itemDetails
      };
    });

    res.status(200).json({
      success: true,
      data: statusList
    });

  } catch (err) {
    console.error("Error fetching student fee status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getStudentFeeDetails = async (req, res) => {
  const { admission_no } = req.params;

  try {
    const studentData = await student.findOne({
      where: { admission_no },
      include: [
        {
          model: fee,
          as: 'fee',
          attributes: ['feestype', 'paid_amount', 'pay_method', 'receipt_no', 'pay_date']
        },
        {
          model: fee_plan,
          as: 'fee_plan',
          attributes: ['feestype', 'total_fee', 'due_date'],
        }
      ]
    });

    if (!studentData) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Group payments by fee type and sum paid
    const feePaidMap = {};
    studentData.fee.forEach(f => {
      const type = f.feestype;
      if (!feePaidMap[type]) feePaidMap[type] = 0;
      feePaidMap[type] += f.paid_amount;
    });

    // Compose fees section
    const fees = studentData.fee_plan.map(fp => {
      const paid = feePaidMap[fp.feestype] || 0;
      const due = fp.total_fee - paid;
      return {
        type: fp.feestype,
        total: fp.total_fee,
        paid,
        due,
        due_date: fp.due_date 
      
      };
    });


    // Compose history section
    const history = studentData.fee.map(f => ({
      date: f.pay_date ? f.pay_date : null,
      fee_type: f.type,
      pay_method: f.pay_method || 'N/A',
      paid_amount: f.paid_amount,
      receipt_no: f.receipt_no || null
    }));

    const response = {
      name: studentData.student_name,
      admission_no: studentData.admission_no,
      class: studentData.class,
      section: studentData.section,
      fees,
      history
    };

    return res.json(response);
  } catch (error) {
    console.error('Error in getStudentFeeDetails:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
