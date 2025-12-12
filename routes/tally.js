// routes/tally.js
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { fee } = require('../models'); // your fee model
router.use(bodyParser.json());

// simple API keys (single-school)
function requireAgentKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key || key !== process.env.TALLY_AGENT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - invalid agent key' });
  }
  next();
}

// GET pending payments
router.get('/pending-payments', requireAgentKey, async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
    const pending = await fee.findAll({
      where: { tally_sync_status: 'pending' },
      order: [['pay_date', 'ASC']],
      limit,
    });
    const payload = pending.map(p => ({
      payment_id: p.sl_no || p.id,
      receipt_no: p.receipt_no,
      pay_date: p.pay_date,
      paid_amount: Number(p.paid_amount),
      feestype: p.feestype,
      admission_no: p.admission_no,
      student_name: p.student_name || null,
      payment_mode: p.pay_method || 'Online',
      bank_name: p.bank_name || null,
      payment_notes: p.payment_notes || null
    }));
    res.json(payload);
  } catch (err) {
    console.error('pending-payments error', err);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

// POST mark status
router.post('/mark', requireAgentKey, async (req, res) => {
  try {
    const { payment_id, status, tally_voucher_no, error, tally_response } = req.body;
    if (!payment_id || !status) return res.status(400).json({ error: 'payment_id and status required' });
    const f = await fee.findOne({ where: { sl_no: payment_id } });
    if (!f) return res.status(404).json({ error: 'payment not found' });

    await f.update({
      tally_sync_status: status,
      tally_sync_tried_at: new Date(),
      tally_voucher_no: tally_voucher_no || f.tally_voucher_no,
      tally_sync_error: error || null
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('mark error', err);
    res.status(500).json({ error: 'Failed to mark payment' });
  }
});

module.exports = router;
