const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const { user: User } = require("../models"); // Import your User model
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_SERVICE_SID;
const client = twilio(accountSid, authToken);
const JWT_SECRET = process.env.JWT_SECRET || "277DF61AE717C633";

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
  const { phonenumber, code } = req.body;

  if (!phonenumber || !code) {
    return res
      .status(400)
      .send({ success: false, message: "Phone number and OTP are required" });
  }

  try {
    // Verify OTP
    const verificationCheck = await verifyOTP(phonenumber, code);
    if (verificationCheck.status !== "approved") {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    // Find user by phone number (using phonenumber field)
    let user = await User.findOne({
      where: { phonenumber },
      attributes: [
        "unique_id",
        "name",
        "phonenumber",
        "role",
        "created_at",
        "updated_at",
      ],
    });

    if (!user) {
      // Create a new user if not found
      user = await User.create({
        name: "Guest", // Default name for new users
        phonenumber, // Store the phone number
        role: "student", // Default role
        status: "active", // New users are active by default
      });
    } else {
      // If user exists, update their status if needed
      if (user.status === "inactive") {
        await user.update({ status: "active" });
        console.log(`User ${user.unique_id} reactivated.`);
      }

      // Assuming you have a login_count field in the user model (modify this if needed)
      user.login_count = user.login_count ? user.login_count + 1 : 1;

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { unique_id: user.unique_id, phonenumber: user.phonenumber },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response with the token and user details
    res.status(200).send({
      success: true,
      message: "OTP verified successfully",
      token: `Bearer ${token}`,
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
