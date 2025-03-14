const express = require("express");

// Raw body parser for GitHub webhooks
const rawBodyParser = express.raw({ type: "application/json" });

const jsonParser = express.json();

module.exports = {
  rawBodyParser,
  jsonParser
};