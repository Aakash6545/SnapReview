const express = require("express");
const { jsonParser } = require("../middleware/bodyParser");
const webhookRoutes = require("./webhookRoutes");
const healthRoutes = require("./healthRoutes");

const router = express.Router();


router.use(jsonParser);


router.use(webhookRoutes);
router.use(healthRoutes);

module.exports = router;