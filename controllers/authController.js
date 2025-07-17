const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const { user: User } = require("../models");
const { sequelize } = require("../models");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_SERVICE_SID;
const client = twilio(accountSid, authToken);
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || "YOUR_REFRESH_SECRET_HERE";
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID; // Your Twilio Messaging Service SID
const refreshTokens = new Set();

// Function to send OTP via Twilio
const sendOTP = async (phone_number) => {
  try {
    return await client.verify.v2.services(verifyServiceSid).verifications.create({
      to: phone_number,
      channel: "sms",
    });
  } catch (error) {
    throw error;
  }
};

// Function to verify OTP via Twilio
const verifyOTP = async (phone_number, code) => {
  try {
    return await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
      to: phone_number,
      code,
    });
  } catch (error) {
    throw error;
  }
};

const generateRandomPassword = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
};

// Controller to handle sending OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ success: false, message: "Phone number is required" });

    const verification = await sendOTP(phone_number);
    res.status(200).json({ success: true, status: verification.status });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

// Controller to handle verifying OTP and registering user
exports.verifyOTP = async (req, res) => {
  try {
    const { phone_number, code, role } = req.body;
    if (!phone_number || !code) return res.status(400).json({ success: false, message: "Phone number and OTP are required" });

    const verificationCheck = await verifyOTP(phone_number, code);
    if (verificationCheck.status !== "approved") return res.status(400).json({ success: false, message: "Invalid OTP" });

    let user = await User.findOne({ where: { phone_number } });
    if (!user) {
      const validRoles = ["admin", "operator"];
      const assignedRole = validRoles.includes(role) ? role : "admin";
      const plainPassword = generateRandomPassword();

      user = await User.create({
        phone_number,
        role: assignedRole,
        password: plainPassword, // Storing password as plain text
        status: "active",
      });

      return res.status(201).json({ success: true, message: "User registered successfully", unique_id: user.unique_id, password: plainPassword });
    }
    return res.status(400).json({ success: false, message: "User already registered. Use unique_id and password to login." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to verify OTP", error: error.message });
  }
};

// Controller to create a new user
exports.createUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { role, phone_number, name } = req.body;

    if (!req.user || !["admin", "operator"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (["operator", "admin"].includes(role) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Operator cannot create this role" });
    }

    if (!phone_number || !name) {
      return res.status(400).json({ success: false, message: "Phone number and name are required" });
    }

    const password = generateRandomPassword();

    const newUser = await User.create(
      {
        phone_number,
        name,
        role,
        password,
        status: "active",
      },
      { transaction: t }
    );

    const messageOptions = {
      to: phone_number,
      body: `Hello ${name}, your account has been created.\nUser ID: ${newUser.unique_id}\nPassword: ${password}`,
    };

    if (fromNumber) {
      messageOptions.from = fromNumber;
    } else if (messagingServiceSid) {
      messageOptions.messagingServiceSid = messagingServiceSid;
    } else {
      throw new Error("Twilio 'from' phone number or MessagingServiceSid is not configured.");
    }

    await client.messages.create(messageOptions);
    await t.commit();

    res.status(201).json({
      success: true,
      message: `${role} created successfully. Credentials sent via SMS.`,
      unique_id: newUser.unique_id,
      password,
    });
  } catch (error) {
    await t.rollback();
    console.error("User creation error:", error);
    res.status(500).json({ success: false, message: "User creation failed", error: error.message });
  }
};


// Controller to handle login
exports.login = async (req, res) => {
  try {
    const { unique_id, password } = req.body;

    if (!unique_id || !password) {
      return res.status(400).json({ success: false, message: "Unique ID and password are required" });
    }

    const user = await User.findOne({ where: { unique_id } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if this is the first login (force password reset)
    if (user.first_time_login) {
      return res.status(403).json({
        success: false,
        message: "Password reset required. Please reset your password before logging in.",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ unique_id: user.unique_id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    const refreshToken = jwt.sign({ unique_id: user.unique_id }, REFRESH_SECRET, { expiresIn: "7d" });
    refreshTokens.add(refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: `Bearer ${token}`,
      refreshToken,
      user: {
        unique_id: user.unique_id,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// Controller to reset password
// Controller to handle OTP-based password reset (must have verified OTP)
// authController.js
exports.resetPassword = async (req, res) => {
  try {
    const { phone_number, new_password } = req.body;

    if (!phone_number || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and new password are required",
      });
    }

    const formattedPhone = phone_number.startsWith("+") ? phone_number : `+91${phone_number}`;
    const user = await User.findOne({ where: { phone_number: formattedPhone } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Optional: Check reset window
    if (user.last_password_reset) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      if (new Date(user.last_password_reset) > oneMonthAgo) {
        return res.status(403).json({
          success: false,
          message: "You can only reset your password once every 30 days.",
        });
      }
    }

    // Update password
    await user.update({
      password: new_password,
      first_time_login: false,
      last_password_reset: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Password Reset Error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};


// authController.js
exports.verifyResetOTP = async (req, res) => {
  try {
    const { phone_number, code } = req.body;

    if (!phone_number || !code) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const formattedPhone = phone_number.startsWith("+") ? phone_number : `+91${phone_number}`;
    const verificationCheck = await verifyOTP(formattedPhone, code);

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Mark OTP verified in frontend (no DB state needed)
    return res.status(200).json({
      success: true,
      message: "OTP verified. Proceed to set a new password.",
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};
