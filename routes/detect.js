const express = require('express')
const { spawn } = require("node:child_process");
const { Buffer } = require("node:buffer");
const router = express.Router();

const pythonProcess = spawn("python", ["./backend/scripts/AI.py"]);

pythonProcess.on('spawn', () => {
    console.log(`Python process started.`)
})


const handlePythonProcess = (ws) => {
    // Only set up the stdout listener once
    pythonProcess.stdout.on("data", (data) => {
      console.log(data.toString());
      // Send data back to the WebSocket when Python produces output
      ws.send(data.toString());
    });
  
    ws.on("message", (msg) => {
      // Convert received message to base64 and send to Python process
      const base64Data = Buffer.from(msg).toString("base64");
      pythonProcess.stdin.write(base64Data + "\n");
    });
  
    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  };

router.ws('/', (ws, req) => {
    handlePythonProcess(ws)
})

module.exports = router