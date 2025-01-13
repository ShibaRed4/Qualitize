const express = require("express");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const { spawn, exec } = require("node:child_process");
const ollama = require("../lib/ollamaClient");
const { User } = require("../lib/db"); // Import the User model and sequelize instance
const jwt = require("jsonwebtoken");

const router = express.Router();

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

async function transcribe(req) {
  const default_audio_path = "./backend/whisper/temp";
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const inputData = req.body.payload;
  const randomId = crypto.randomBytes(16).toString("hex");

  if (base64regex.test(inputData)) {
    // Create a new promise to handle the async behavior
    return new Promise((resolve, reject) => {
      const command = "whisper";
      const args = [
        `${default_audio_path}/${randomId}.wav`, // Input file
        "--language",
        "en", // Language
        "--model",
        "base", // Model
        "--device",
        "cuda", // Device
        "--output_format",
        "txt", // Output format
        "--output_dir",
        `./backend/whisper/output/${randomId}`, // Output directory
      ];

      // Write the base64 data to a WAV file
      fs.writeFileSync(
        `${default_audio_path}/${randomId}.wav`,
        Buffer.from(inputData, "base64")
      );

      // Spawn the whisper process
      const child = spawn(command, args);

      child.on("close", (code) => {
        // Handle file deletion and transcription reading after process completes
        fs.unlink(path.join(default_audio_path, `${randomId}.wav`), (err) => {
          if (err) {
            console.error(`Error deleting WAV file: ${err}`);
            reject(err); // Reject the promise if file deletion fails
            return;
          }
        });

        // Read the transcription output file
        const transcriptionFilePath = path.join(
          "./backend/whisper/output",
          randomId,
          `${randomId}.txt`
        );

        if (fs.existsSync(transcriptionFilePath)) {
          const text_transcription = fs.readFileSync(
            transcriptionFilePath,
            "utf-8"
          );

          // Delete the output directory
          fs.rmdir(
            path.join("./backend/whisper/output", randomId),
            { recursive: true },
            (err) => {
              if (err) {
                console.error(`Error deleting directory: ${err}`);
              }
            }
          );

          // Resolve the promise with the transcription text
          resolve(text_transcription);
        } else {
          reject("Transcription file not found"); // Reject if the transcription file doesn't exist
        }
      });

      child.on("error", (err) => {
        console.error("Error with whisper process:", err);
        reject(err); // Reject the promise if the child process encounters an error
      });
    });
  } else {
    return Promise.reject("Invalid base64 input"); // Reject if base64 regex doesn't match
  }
}

async function generateSpeech(text, outputFilePath) {
  return new Promise((resolve, reject) => {
    // Escape special characters in text
    const escapedText = text.replace(/(["`\\])/g, '\\$1'); // Escape quotes and backticks for safety

    const command = `echo "${escapedText}" | piper --model ./backend/piper/en_US-amy-low.onnx --output_file ${outputFilePath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        return;
      }
      resolve(outputFilePath); // Return the path to the generated file
    });
  });
}

router.post("/", async (req, res) => {
  const user = await grabUserFromToken(req);
  const transcription = await transcribe(req);
  const userData = JSON.parse(user.user_data);


  userData.chat_history.push({ role: "user", content: transcription });

  const messages = userData.chat_history.map((item) => ({
    role: item.role,
    content: item.content,
  }));

  const modelResponse = await ollama.chat({
    model: "llama3.2:1b",
    messages: messages,
  });

  const aiMessage = modelResponse.message.content;
  userData.chat_history.push({ role: "ai", message: aiMessage });

  User.update(
    {
      user_data: userData,
    },
    {
      where: { id: user.id },
    }
  );

  const randomId = crypto.randomBytes(16).toString("hex");
  const audioFilePath = `./backend/piper/output/${randomId}.wav`;
  await generateSpeech(aiMessage, audioFilePath);

    // Read the audio file and return the base64-encoded result
  const audioData = fs.readFileSync(audioFilePath);
  const base64Audio = audioData.toString("base64");

    // Clean up the generated audio file
  fs.unlinkSync(audioFilePath);

    // Return the base64 audio and the updated chat history
  res.json({
    audio: base64Audio,
    chat_history: userData.chat_history,
  });

});

module.exports = router;
