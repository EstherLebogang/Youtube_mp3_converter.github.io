// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const youtubedl = require("youtube-dl-exec"); // Use cross-platform yt-dlp wrapper

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DOWNLOAD_FOLDER = path.join(__dirname, "public", "downloads");

// Ensure downloads folder exists
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
  fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
}

// Download MP3
app.post("/api/download/mp3", async (req, res) => {
  const { url } = req.body;
  const filename = `audio-${uuidv4()}.mp3`;
  const outputPath = path.join(DOWNLOAD_FOLDER, filename);

  try {
    await youtubedl(url, {
      output: outputPath,
      extractAudio: true,
      audioFormat: "mp3",
    });

    res.json({ file: `/downloads/${filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to convert to MP3: " + err.message });
  }
});

// Download MP4
app.post("/api/download/mp4", async (req, res) => {
  const { url } = req.body;
  const filename = `video-${uuidv4()}.mp4`;
  const outputPath = path.join(DOWNLOAD_FOLDER, filename);

  try {
    await youtubedl(url, {
      output: outputPath,
      format: "bestvideo+bestaudio",
      mergeOutputFormat: "mp4"
    });

    res.json({ file: `/downloads/${filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to convert to MP4: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
