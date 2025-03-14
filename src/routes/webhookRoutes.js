const express = require("express");
const { rawBodyParser } = require("../middleware/bodyParser.js");
const { handleWebhook } = require("../controllers/webhookController");

const router = express.Router();

router.post("/github-webhook", rawBodyParser, handleWebhook);

module.exports = router;