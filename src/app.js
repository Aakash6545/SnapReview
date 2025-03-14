const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.raw({ type: "application/json" }));
// Apply routes
app.use(routes);

module.exports = app;