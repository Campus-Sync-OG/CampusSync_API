const twilio = require("twilio");

const jwt = require("jsonwebtoken");
const { user: User } = require("../models"); // Import User model
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_SERVICE_SID;
const client = twilio(accountSid, authToken);
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const refreshTokens = new Set(); 


// Function to send OTP via Twilio
const sendOTP = async (phone_number) => {
  try {
    // Ensure phone_number is a string and remove extra spaces
    phone_number = phone_number.toString().trim();    
    // If the number is 10 digits (without country code), prepend "+91"
    if (/^\d{10}$/.test(phone_number)) {
      phone_number = `+91${phone_number}`;
    }
    // Validate the final format (should be E.164 format)
    if (!/^\+91\d{10}$/.test(phone_number)) {
      throw new Error("Invalid phone number format");
    }

    // Send OTP using Twilio Verify API
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone_number, channel: "sms" });

    return verification;
  } catch (error) {
    console.error("Twilio OTP Error:", error);
    throw error;
  }
};


// Function to verify OTP via Twilio

const verifyOTP = async (phone_number, code, role ) => {
  try {
    // Ensure phone_number is a string and remove extra spaces
    phone_number = phone_number.toString().trim();

    // If the number is 10 digits (without country code), prepend "+91"
    if (/^\d{10}$/.test(phone_number)) {
      phone_number = `+91${phone_number}`;
    }

    // Validate the final format (should be E.164 format)
    if (!/^\+91\d{10}$/.test(phone_number)) {
      throw new Error("Invalid phone number format");
    }

    // Verify OTP using Twilio Verify API
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone_number, code ,role });

    return verificationCheck;
  } catch (error) {
    console.error("Twilio OTP Verification Error:", error);
    throw error;
  }
};


// Controller to handle sending OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res
        .status(400)
        .send({ success: false, message: "Phone number is required" });
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

// Controller to handle verifying OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone_number, code, role } = req.body; // Extract role from request body

    console.log("Incoming Request Data:", req.body); // DEBUGGING: Check received data

    if (!phone_number || !code) {
      return res
        .status(400)
        .send({ success: false, message: "Phone number and OTP are required" });
    }

    // Verify OTP
   
    const verificationCheck = await verifyOTP(phone_number, code,role);
    if (verificationCheck.status !== "approved") {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { phone_number } });

    if (!user) {
      // Ensure role is valid
      const validRoles = ["student", "teacher", "principal"];
      const assignedRole = validRoles.includes(role) ? role : "student";
         
      console.log(`Assigned Role: ${assignedRole}`); // DEBUGGING: Check assigned role

      // Create new user
      user = await User.create({
        name: "Guest",
        phone_number,
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
      { unique_id: user.unique_id, phone_number: user.phone_number, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { unique_id: user.unique_id, phone_number: user.phone_number },
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
        phone_number: user.phone_number,
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