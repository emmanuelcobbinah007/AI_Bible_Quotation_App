import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import mongoose from "mongoose";
import axios from "axios";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define BibleVerse schema and model
const bibleVerseSchema = new mongoose.Schema({
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verse: { type: Number, required: true },
  text: { type: String, required: true },
  version: { type: String, required: true },
});

const BibleVerse = mongoose.model("BibleVerse", bibleVerseSchema);

// Upload chunk endpoint
app.post("/upload-chunk", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const audioBuffer = req.file.buffer;
    const transcript = await transcribeAudio(audioBuffer);
    const detectedVerses = await detectBibleVerses(transcript);

    const versesWithText = await Promise.all(
      detectedVerses.map(async (verse) => ({
        reference: verse,
        text: await fetchBibleVerse(verse),
      }))
    );

    res.status(200).json({
      message: "Chunk uploaded and processed!",
      transcript,
      verses: versesWithText,
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    res.status(500).json({ error: "Failed to process audio." });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Transcribe audio using Deepgram
async function transcribeAudio(audioBuffer) {
  try {
    const response = await axios.post(
      "https://api.deepgram.com/v1/listen",
      audioBuffer,
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/wav",
        },
        params: {
          language: "en",
        },
      }
    );

    if (!response.data.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      throw new Error("No transcript found in Deepgram response.");
    }

    return response.data.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.error("Error transcribing with Deepgram:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// Detect Bible verses using NLP (example)
async function detectBibleVerses(transcription) {
  try {
    const response = await axios.post(
      "https://api.gemini.com/detect-verses", // Replace with actual API
      { text: transcription },
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },
      }
    );

    return response.data.verses || [];
  } catch (error) {
    console.error("Error detecting Bible verses:", error);
    return [];
  }
}

// Fetch Bible verse text from MongoDB
async function fetchBibleVerse(reference) {
  try {
    const { book, chapter, startVerse, endVerse } = parseReference(reference);

    const query = {
      book,
      chapter,
      verse: { $gte: startVerse, $lte: endVerse || startVerse },
      version: "KJV",
    };

    const verses = await BibleVerse.find(query);

    if (!verses.length) {
      throw new Error("Verse not found in the database.");
    }

    return verses.map((v) => v.text).join(" ");
  } catch (error) {
    console.error("Error fetching Bible verse from database:", error);
    return null;
  }
}

// Parse Bible reference (e.g., "John 3:16" or "Psalm 23:1-6")
function parseReference(reference) {
  const regex = /^(.*?)\s(\d+):(\d+)(?:-(\d+))?$/;
  const match = reference.match(regex);

  if (!match) {
    throw new Error("Invalid reference format");
  }

  const [, book, chapter, startVerse, endVerse] = match;
  return {
    book,
    chapter: parseInt(chapter),
    startVerse: parseInt(startVerse),
    endVerse: endVerse ? parseInt(endVerse) : null,
  };
}