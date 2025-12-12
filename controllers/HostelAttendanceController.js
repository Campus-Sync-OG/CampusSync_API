// controllers/hostelController.js
const { Op } = require('sequelize');
const {student,warden,hostel_block} = require('../models'); // adjust to your project entry (index.js)

// Assumptions (adapt names if different):
// - db.Warden (warden table) has foreignKey hostel_block_id
// - db.HostelBlock (hostel_block table) has { id, name, block_type } where block_type ∈ {'female','male','mixed'}
// - db.Student has { is_hosteller (boolean), gender ('male'|'female'), hostel_block_id (nullable) }
// - req.user contains authenticated user info and req.user.id is the warden's user id

async function getHostelStudentsForWarden(req, res) {
  try {
    const wardenId = req.user && req.user.unique_id;
    if (!wardenId) return res.status(401).json({ error: 'Unauthorized' });

    // Find warden and the hostel block they manage
    const wardens = await warden.findOne({
      where: { id: wardenId },
      include: [
        {
          model: hostel_block,
          as: 'hostel_block', // adjust if you used a different alias
          attributes: ['id', 'name', 'block_type']
        }
      ]
    });

    if (!wardens) return res.status(404).json({ error: 'Warden record not found' });

    const block = wardens.hostel_block;
    if (!block) return res.status(400).json({ error: 'No hostel block assigned to this warden' });

    // Query params
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10)); // cap the limit
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    // Base where: only hostellers
    const where = { is_hosteller: true };

    // If you store hostel_block_id on student, prefer filtering by block id:
    // (This is precise. If you don't have hostel_block_id on student, fall back to gender filter.)
    const studentHasBlockId = !!student.rawAttributes.hostel_block_id; // checks model definition

    if (studentHasBlockId) {
      // filter students by that block id
      where.hostel_block_id = block.id;
    } else {
      // fallback: filter by block_type/gender
      if (block.block_type === 'female') {
        where.gender = 'female';
      } else if (block.block_type === 'male') {
        where.gender = 'male';
      } else {
        // 'mixed' or other: no extra gender filter
      }
    }

    // optional search on name or admission_no
    if (search) {
      // Use iLike for Postgres, adjust to Op.like for MySQL if needed
      where[Op.or] = [
        { name: { [Op.iLike || Op.like]: `%${search}%` } },
        { admission_no: { [Op.iLike || Op.like]: `%${search}%` } }
      ];
      // Note: If using MySQL, sequelize's Op.iLike is not available; use Op.like instead.
    }

    // Select only needed attributes to minimize payload
    const attributes = ['id', 'admission_no', 'name', 'class_name', 'section_name', 'gender', 'room_no', 'hostel_block_id'];

    const { rows, count } = await student.findAndCountAll({
      where,
      attributes,
      order: [['name', 'ASC']],
      limit,
      offset
    });

    return res.json({
      meta: { page, limit, total: count },
      data: rows
    });
  } catch (err) {
    console.error('getHostelStudentsForWarden error:', err);
    return res.status(500).json({ error: 'Failed to fetch hostel students' });
  }
}

module.exports = { getHostelStudentsForWarden };
