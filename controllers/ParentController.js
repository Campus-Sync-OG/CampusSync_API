const { parent } = require("../models");

exports.getParent = async (req, res) => {
  try {
    const { admission_no } = req.params;

    const Parent = await parent.findOne({ where: { admission_no } });

    if (!Parent) {
      return res.status(404).json({ success: false, message: "Parent info not found" });
    }

    res.status(200).json({ success: true, data: Parent });
  } catch (error) {
    console.error("Error fetching parent info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// **Delete Parent Info by Admission Number**
exports.deleteParent = async (req, res) => {
  try {
    const { admission_no } = req.params;

    const Parent = await parent.findOne({ where: { admission_no } });

    if (!Parent) {
      return res.status(404).json({ success: false, message: "Parent info not found" });
    }

    await parent.destroy({ where: { admission_no } });

    res.status(200).json({ success: true, message: "Parent info deleted successfully" });
  } catch (error) {
    console.error("Error deleting parent info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// **Update Parent Info by Admission Number**
exports.updateParent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const updatedData = req.body;

    const Parent = await parent.findOne({ where: { admission_no } });

    if (!Parent) {
      return res.status(404).json({ success: false, message: "Parent info not found" });
    }

    await parent.update(updatedData, { where: { admission_no } });

    const updatedParent = await parent.findOne({ where: { admission_no } });

    res.status(200).json({ success: true, message: "Parent info updated successfully", data: updatedParent });
  } catch (error) {
    console.error("Error updating parent info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

