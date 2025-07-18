// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const helmet = require("helmet"); // ✅ ADD HELMET

const ffmpegPath = "ffmpeg";
const ytDlpPath = "yt-dlp";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ✅ Helmet with custom CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'"],
      },
    },
  })
);

const DOWNLOAD_FOLDER = path.join(__dirname, "public");

function runYtDlp(url, format) {
  const id = uuidv4();
  const output = path.join(DOWNLOAD_FOLDER, `${id}.${format}`);
  const command = `${ytDlpPath} "${url}" -x --audio-format ${format} -o "${output}" --ffmpeg-location ${ffmpegPath}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Exec error:", error);
        console.error("stderr:", stderr);
        return reject(stderr || error.message);
      }
      console.log("stdout:", stdout);
      resolve(`/${path.basename(output)}`);
    });
  });
}

app.post("/api/download/mp3", async (req, res) => {
  const { url } = req.body;
  try {
    const file = await runYtDlp(url, "mp3");
    res.json({ file });
  } catch (err) {
    res.status(500).json({ error: "Failed to convert to MP3: " + err });
  }
});

app.post("/api/download/mp4", async (req, res) => {
  const { url } = req.body;
  try {
    const id = uuidv4();
    const output = path.join(DOWNLOAD_FOLDER, `${id}.mp4`);
    const command = `${ytDlpPath} "${url}" -f bestvideo+bestaudio --merge-output-format mp4 -o "${output}" --ffmpeg-location ${ffmpegPath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Exec error:", error);
        console.error("stderr:", stderr);
        return res.status(500).json({ error: stderr || error.message });
      }
      console.log("stdout:", stdout);
      res.json({ file: `/${path.basename(output)}` });
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to convert to MP4: " + err });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


