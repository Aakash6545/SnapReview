const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { jsonParser } = require("../middleware/bodyParser");

// Verify GitHub Webhook Signature
function verifySignature(signature, payload) {
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!signature) {
      console.log(" No signature header found");
      return false;
    }

    if (!payload) {
      console.log(" No payload found");
      return false;
    }

    // Ensure payload is a Buffer
    const payloadBuffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(payload);

    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(payloadBuffer).digest("hex");

    console.log("Expected signature:", digest);
    console.log("Received signature:", signature);

    // Compare signatures in a secure way
    try {
      return crypto.timingSafeEqual(
        Buffer.from(digest),
        Buffer.from(signature)
      );
    } catch (err) {
      console.error(" Error comparing signatures:", err.message);
      return false;
    }
  } catch (err) {
    console.error(" Signature verification error:", err.message);
    return false;
  }
}

// Generate GitHub App JWT
function generateAppJWT() {
  const appId = process.env.GITHUB_APP_ID;

  // Handle PEM format private key
  // The key should be stored in .env file with literal newlines
  // or with \n characters that need to be replaced
  const privateKey = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n");

  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 600,
    iss: appId,
  };

  try {
    const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
    return token;
  } catch (err) {
    console.error(" Error generating JWT:", err.message);
    throw new Error("Failed to generate JWT. Check your private key format.");
  }
}

module.exports = {
  verifySignature,
  generateAppJWT
};