const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const { user: User } = require("../models"); // Import User model
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_SERVICE_SID;
const client = twilio(accountSid, authToken);
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || "YOUR_REFRESH_SECRET_HERE";
const refreshTokens = new Set(); 


// Function to send OTP via Twilio
const sendOTP = async (phoneNumber) => {
  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phoneNumber, channel: "sms" });
    return verification;
  } catch (error) {
    throw error;
  }
};

// Function to verify OTP via Twilio
const verifyOTP = async (phoneNumber, code) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phoneNumber, code });
    return verificationCheck;
  } catch (error) {
    throw error;
  }
};

// Controller to handle sending OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phonenumber } = req.body;
    if (!phonenumber) {
      return res
        .status(400)
        .send({ success: false, message: "Phone number is required" });
    }

    const verification = await sendOTP(phonenumber);
    res.status(200).send({ success: true, status: verification.status });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// Controller to handle verifying OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phonenumber, code, role } = req.body; // Extract role from request body

    console.log("Incoming Request Data:", req.body); // DEBUGGING: Check received data

    if (!phonenumber || !code) {
      return res
        .status(400)
        .send({ success: false, message: "Phone number and OTP are required" });
    }

    // Verify OTP
    const verificationCheck = await verifyOTP(phonenumber, code);
    if (verificationCheck.status !== "approved") {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { phonenumber } });

    if (!user) {
      // Ensure role is valid
      const validRoles = ["student", "teacher", "principal"];
      const assignedRole = validRoles.includes(role) ? role : "student";

      console.log(`Assigned Role: ${assignedRole}`); // DEBUGGING: Check assigned role

      // Create new user
      user = await User.create({
        name: "Guest",
        phonenumber,
        role: assignedRole, // Assign role dynamically
        status: "active",
      });

      console.log(`New User Created: ${user.unique_id}, Role: ${user.role}`);
    } else {
      // If user exists, update status if inactive
      if (user.status === "inactive") {
        await user.update({ status: "active" });
        console.log(`User ${user.unique_id} reactivated.`);
      }

      // Increment login count
      user.login_count = user.login_count ? user.login_count + 1 : 1;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { unique_id: user.unique_id, phonenumber: user.phonenumber, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { unique_id: user.unique_id, phonenumber: user.phonenumber },
      REFRESH_SECRET,
      { expiresIn: "1h" } // Refresh token valid for 7 days
    );

    refreshTokens.add(refreshToken); 

    // Send response with token and user details
    res.status(200).send({
      success: true,
      message: "OTP verified successfully",
      token: `Bearer ${token}`,
      refreshToken, 
      user: {
        unique_id: user.unique_id,
        name: user.name,
        phonenumber: user.phonenumber,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        login_count: user.login_count,
      },
    });
  } catch (error) {
    console.error("Verification failed:", error);
    res.status(500).send({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};
