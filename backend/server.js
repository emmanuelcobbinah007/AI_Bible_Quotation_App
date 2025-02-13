import express from "express";
import multer from "multer";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Simulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multer setup for handling audio chunks
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle audio chunks
app.post("/upload-chunk", upload.single("audio"), async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;
    console.log("Received audio chunk");

    // Transcribe audio with Whisper API
    const transcript = await transcribeWithWhisper(audioBuffer);

    // Detect Bible verses from the transcript (mock function)
    const detectedVerses = detectBibleVerses(transcript);

    res.json({ transcript, detectedVerses });
  } catch (error) {
    console.error("Error processing audio chunk:", error);
    res.status(500).json({ error: "Failed to process audio" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Function to transcribe audio with Whisper API
async function transcribeWithWhisper(audioBuffer) {
  try {
    const response = await openai.createTranscription(
      audioBuffer,
      "whisper-1",
      "This audio is from a Bible study session. Identify and return Bible verses mentioned, such as 'John 3:16,' 'Romans 8:28,' or 'Psalm 23:1.' If a Bible version is mentioned (e.g., 'NIV,' 'KJV,' 'ESV'), include it in the transcription.",
      "json",
      1,
      "en"
    );
    return response.data.text;
  } catch (error) {
    console.error("Error during transcription:", error);
    throw new Error("Transcription failed");
  }
}

// Mock function to detect Bible verses
function detectBibleVerses(transcription) {
  // Add logic to search for Bible verses in the transcript
  return ["John 3:16", "Romans 8:28"]; // Example detected verses
}
