// routes/tally.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { fee, student } = require("../models");

router.use(bodyParser.json());

/* ================= AUTH ================= */

function requireAgentKey(req, res, next) {
  const key = req.headers["x-api-key"] || req.query.api_key;
  if (!key || key !== process.env.TALLY_AGENT_API_KEY) {
    return res.status(401).json({ error: "Unauthorized - invalid agent key" });
  }
  next();
}

/* ================= GET PENDING PAYMENTS ================= */

router.get("/pending-payments", requireAgentKey, async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit || "50", 10));

    const pending = await fee.findAll({
      where: {
        tally_sync_status: "pending",
        deletedAt: null
      },
      include: [{
        model: student,
        attributes: ["student_name"]
      }],
      order: [["pay_date", "ASC"]],
      limit
    });

    const payload = pending.map(p => ({
      sl_no: p.sl_no,                         // ✅ FIXED
      receipt_no: p.receipt_no,
      pay_date: p.pay_date,
      paid_amount: Number(p.paid_amount),
      feestype: p.feestype,
      admission_no: p.admission_no,
      student_name: p.student?.student_name || null,
      payment_mode: p.pay_method || "Online",
      bank_name: p.bank_name || null,
      payment_notes: p.payment_notes || null
    }));

    res.json(payload);
  } catch (err) {
    console.error("pending-payments error", err);
    res.status(500).json([]);
  }
});

/* ================= MARK TALLY STATUS ================= */

router.post("/mark", requireAgentKey, async (req, res) => {
  try {
    const { sl_no, status, tally_voucher_no, error, tally_response } = req.body;

    if (!Number.isInteger(sl_no) || !status) {
      return res.status(400).json({ error: "sl_no (int) and status required" });
    }

    const f = await fee.findOne({ where: { sl_no } });
    if (!f) return res.status(404).json({ error: "Payment not found" });

    await f.update({
      tally_sync_status: status,
      tally_sync_tried_at: new Date(),
      tally_voucher_no: tally_voucher_no || f.tally_voucher_no,
      tally_sync_error: error || null
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("mark error", err);
    res.status(500).json({ error: "Failed to mark payment" });
  }
});

module.exports = router;
