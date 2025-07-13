// server.js
// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const youtubedl = require("youtube-dl-exec");
const ffmpegPath = require("ffmpeg-static");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DOWNLOAD_FOLDER = path.join(__dirname, "public");

// Function to convert YouTube to MP3
function runYtDlp(url, format) {
  const id = uuidv4();
  const output = path.join(DOWNLOAD_FOLDER, `${id}.${format}`);

  return youtubedl(url, {
    extractAudio: true,
    audioFormat: format,
    output: output,
    ffmpegLocation: ffmpegPath,
  })
    .then(() => `/${path.basename(output)}`)
    .catch((err) => {
      console.error("❌ Conversion error:", err);
      throw new Error(err.stderr || err.message || "Conversion failed.");
    });
}

// Convert to MP3
app.post("/api/download/mp3", async (req, res) => {
  const { url } = req.body;
  try {
    const file = await runYtDlp(url, "mp3");
    res.json({ file });
  } catch (err) {
    res.status(500).json({ error: "Failed to convert to MP3: " + err.message });
  }
});

// Convert to MP4
app.post("/api/download/mp4", async (req, res) => {
  const { url } = req.body;
  const id = uuidv4();
  const output = path.join(DOWNLOAD_FOLDER, `${id}.mp4`);

  try {
    await youtubedl(url, {
      format: "bestvideo+bestaudio",
      mergeOutputFormat: "mp4",
      output: output,
      ffmpegLocation: ffmpegPath,
    });

    res.json({ file: `/${path.basename(output)}` });
  } catch (err) {
    console.error("❌ MP4 Conversion error:", err);
    res.status(500).json({ error: "Failed to convert to MP4: " + (err.stderr || err.message) });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

