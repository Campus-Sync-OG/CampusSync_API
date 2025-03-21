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
const sendOTP = async (phone_number) => {
  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone_number, channel: "sms" });
    return verification;
  } catch (error) {
    throw error;
  }
};

// Function to verify OTP via Twilio
const verifyOTP = async (phone_number, code) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone_number, code });
    return verificationCheck;
  } catch (error) {
    throw error;
  }
};

// Function to generate unique ID

// Controller to handle sending OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).send({ success: false, message: "Phone number is required" });
    }

    const verification = await sendOTP(phone_number);
    res.status(200).send({ success: true, status: verification.status });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

const generateRandomPassword = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
// Controller to handle verifying OTP and registering user
exports.verifyOTP = async (req, res) => {
  try {
    const { phone_number, code, role } = req.body;

    if (!phone_number || !code) {
      return res.status(400).send({ success: false, message: "Phone number and OTP are required" });
    }

    // Verify OTP using Twilio
    const verificationCheck = await verifyOTP(phone_number, code);
    if (verificationCheck.status !== "approved") {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { phone_number } });

    if (!user) {
      const validRoles = ["admin", "operator"];
      const assignedRole = validRoles.includes(role) ? role : "admin";

      const password = generateRandomPassword(); // Generate plain text password

      user = await User.create({
        phone_number,
        role: assignedRole,
        password, // Pass the plain text password, but it will be hashed inside model hooks
        status: "active",
      });

      // The unique_id will be automatically generated from the model's hook
      return res.status(201).send({
        success: true,
        message: "User registered successfully",
        unique_id: user.unique_id, // Take generated unique_id from the model
        password, // Send plain password for first-time login
      });
    } else {
      return res.status(400).send({
        success: false,
        message: "User already registered. Use unique_id and password to login.",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};



// Controller to create a new user (Student, Teacher, Principal)
// Controller to create a new user (Student, Teacher, Principal)
// Controller to create a new user (Student, Teacher, Principal)
exports.createUser = async (req, res) => {
  try {
    const { role, phone_number } = req.body; // Include phone_number

    if (!req.user || !["admin", "operator"].includes(req.user.role)) {
      return res.status(403).send({ success: false, message: "Only admin or operator can create users." });
    }

    if (!role || !["student", "teacher", "principal"].includes(role)) {
      return res.status(400).send({ success: false, message: "Invalid role. Must be student, teacher, or principal." });
    }

    if (!phone_number) {
      return res.status(400).send({ success: false, message: "Phone number is required." });
    }

    const password = generateRandomPassword();

    const newUser = await User.create({
      phone_number, // Ensure phone_number is included
      role,
      password,
      status: "active",
    });

    res.status(201).send({
      success: true,
      message: `${role} created successfully`,
      unique_id: newUser.unique_id, // Sequelize should generate this
      password,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "User creation failed", error: error.message });
  }
};



// Controller to handle login using unique_id and password
exports.login = async (req, res) => {
  try {
    const { unique_id, password } = req.body;

    if (!unique_id || !password) {
      return res.status(400).send({ success: false, message: "Unique ID and password are required" });
    }

    const user = await User.findOne({ where: { unique_id } });

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).send({ success: false, message: "Invalid password" });
    }

    // Check if this is the first login
    if (user.first_time_login) {
      return res.status(200).send({
        success: true,
        message: "Please reset your password before logging in",
        reset_required: true, // Indicate to the frontend that reset is required
      });
    }

    // Generate JWT token after password reset
    const token = jwt.sign(
      { unique_id: user.unique_id, phone_number: user.phone_number, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { unique_id: user.unique_id, phone_number: user.phone_number },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    refreshTokens.add(refreshToken);

    res.status(200).send({
      success: true,
      message: "Login successful",
      token: `Bearer ${token}`,
      refreshToken,
      user: {
        unique_id: user.unique_id,
        phone_number: user.phone_number,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { unique_id, new_password } = req.body;

    if (!unique_id || !new_password) {
      return res.status(400).send({ success: false, message: "Unique ID and new password are required" });
    }

    const user = await User.findOne({ where: { unique_id } });

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    // Update the user's password and set first_time_login to false
    await user.update({
      password: new_password,
      first_time_login: false, // Mark that the user has reset their password
    });

    res.status(200).send({
      success: true,
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};
