const jwt = require('jsonwebtoken');

// Secret key (should come from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "21b74c8a4e2a3ff5a1b4d302de89b2a644b946a4cbb839c4e7ecf7bd5aa32e34";

// Function to generate a JWT for a phone number
function generateJwtForPhoneNumber(phoneNumber) {
    const payload = { phone: phoneNumber };
    const options = { expiresIn: '1h', issuer: 'your_app_name' };
    return jwt.sign(payload, JWT_SECRET, options);
}

// Function to verify a JWT
function verifyJwtToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error("Invalid token:", error.message);
        return null;
    }
}

module.exports = { generateJwtForPhoneNumber, verifyJwtToken };
