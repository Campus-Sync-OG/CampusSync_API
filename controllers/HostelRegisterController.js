const { HostelRegistration, Student, Room, Hostel, Block } = require("../models");

// 1. Student applies for hostel
exports.applyHostel = async (req, res) => {
    try {
        const { student_id, hostel_id, block_id, room_type } = req.body;

        const registration = await HostelRegistration.create({
            student_id,
            hostel_id,
            block_id,
            room_type,
            status: "pending"
        });

        return res.status(201).json({
            message: "Hostel application submitted successfully",
            registration
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// 2. Warden: get all pending applications
exports.getPendingApplications = async (req, res) => {
    try {
        const pending = await HostelRegistration.findAll({
            where: { status: "pending" },
            include: [Student, Hostel, Block] 
        });

        return res.status(200).json(pending);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// 3. Warden: Approve and assign room
exports.approveAndAssignRoom = async (req, res) => {
    try {
        const { registration_id, room_id } = req.body;

        const registration = await HostelRegistration.findByPk(registration_id);
        if (!registration) return res.status(404).json({ message: "Registration not found" });

        const room = await Room.findByPk(room_id);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Check availability
        if (room.available_beds <= 0) {
            return res.status(400).json({ message: "No beds available in this room" });
        }

        // Assign student to the room
        registration.room_id = room_id;
        registration.status = "approved";
        await registration.save();

        // Reduce available beds
        room.available_beds -= 1;
        await room.save();

        return res.status(200).json({
            message: "Room allocated successfully",
            registration
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
