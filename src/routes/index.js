const express = require("express");
const { jsonParser } = require("../middleware/bodyParser");
const webhookRoutes = require("./webhookRoutes");


const router = express.Router();


router.use(jsonParser);


router.use(webhookRoutes);


module.exports = router;
