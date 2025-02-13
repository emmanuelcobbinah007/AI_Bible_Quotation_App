const express = require("express");
const multer = require("multer");
const { Configuration, OpenAIApi } = require("openai");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Set your API key in .env
});
const openai = new OpenAIApi(configuration);

// Multer setup for handling audio chunks
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle audio chunks
app.post("/upload-chunk", upload.single("audio"), async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;
    console.log("Received audio chunk");

    // Send the chunk to Whisper for transcription
    const transcript = await transcribeWithWhisper(audioBuffer);

    // Example: Detect Bible verses from transcript (mock function for now)
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
      "whisper-1", // Whisper model
      "This audio is from a Bible study session. Identify and return Bible verses mentioned, such as 'John 3:16,' 'Romans 8:28,' or 'Psalm 23:1.' If a Bible version is mentioned (e.g., 'NIV,' 'KJV,' 'ESV'), include it in the transcription. Ensure the verse and version are accurately transcribed, ignoring unrelated speech.", // Optional prompt
      "json", // Response format
      1, // Temperature (adjust for creativity in transcription)
      "en" // Language code (e.g., "en" for English)
    );

    return response.data.text; // Return the transcribed text
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
