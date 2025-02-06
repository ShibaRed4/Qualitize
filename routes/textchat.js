const express = require("express");
const fs = require("node:fs");
const path = require('node:path')
const crypto = require("node:crypto");
const ollama = require("../lib/ollamaClient");
const loadCommands = require('../lib/loadCommands')
const { User } = require("../lib/db"); // Import the User model and sequelize instance
const jwt = require("jsonwebtoken");

const router = express.Router();
const commands = loadCommands(path.join(process.cwd(), 'backend/commands'));

console.log(commands)

async function grabUserFromToken(req) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const decoded = jwt.verify(token, process.env.TOKEN_KEY);

  const user = await User.findOne({
    where: { id: decoded.id },
    attributes: ["id", "username", "user_data"],
  });

  return user;
}

function isCommand(response) {
  // Set a threshold for intent score
  const scoreThreshold = 0.6;

  // Check if intent is valid and score is above the threshold
  return response.intent !== "None" && response.score >= scoreThreshold;
}


router.post("/", async (req, res) => {
  const user = await grabUserFromToken(req);
  const userData = JSON.parse(user.user_data);

  userData.chat_history.push({ role: "user", content: req.body.message });

  const messages = userData.chat_history.map((item) => ({
    role: item.role,
    content: item.content,
  }));

  const response = await req.app.locals.nlpManager.process(
    "en",
    req.body.message
  );

  console.log(response)
 
  if(isCommand(response)){
    commands[response.intent](req)
  } else {
    
  }
});

module.exports = router;
