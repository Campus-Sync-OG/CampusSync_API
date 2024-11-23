const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_SERVICE_SID;
const client = twilio(accountSid, authToken);
const express = require("express");
const { users } = require("../models");
const { where } = require("sequelize");
const app = express();

// Load secret key from environment
const JWT_SECRET = process.env.JWT_SECRET;

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

exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const verification = await sendOTP(phoneNumber);

    res.status(200).send({ success: true, status: verification.status });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Failed to send OTP", error });
  }
};

exports.VerifyOtp = async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    const verificationCheck = await verifyOTP(phoneNumber, code);

    if (verificationCheck.status === "approved") {
      let user = await users.findOne({
        where: { phone_number: phoneNumber },
        attributes: [
          "id",
          "name",
          "phone_number",
          "email",
          "pincode",
          "status",
          "meta",
        ],
      });

      if (!user) {
        user = await users.create({
          name: "NULL",
          phone_number: phoneNumber,
          status: true,
          meta: { login_count: 1 },
        });
      } else {
        if (!user.status) {
          await users.update(
            { status: true },
            { where: { phone_number: phoneNumber } }
          );
        }

        let meta = user.meta || {};
        meta.login_count = meta.login_count ? meta.login_count + 1 : 1;

        await users.update({ meta }, { where: { id: user.id } });
      }

      // Generate JWT token
      const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: "1h" });
      const bearerToken = `Bearer ${token}`;

      // Send response with user details and token
      res.status(200).send({
        success: true,
        message: "OTP verified successfully",
        token: bearerToken,
        user: {
          id: user.id,
          name: user.name,
          phone_number: user.phone_number,
          email: user.email,
          pincode: user.pincode,
          login_count: user.meta.login_count, // Return updated login count
        },
      });
    } else {
      res.status(400).send({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Verification failed: ", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to verify OTP", error });
  }
};
