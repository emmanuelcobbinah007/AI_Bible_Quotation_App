const mongoose = require("mongoose");
const fs = require('fs');
const BibleVerse = require("./bibleVerseSchema");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });  // Ensure .env is loaded from the parent directory


const seedDatabase = async (version) => {
  try {
    console.log(`Loading ${version} data...`);

    // Step 1: Check if the JSON file exists
    const filePath = path.join(__dirname, `./BibleTranslations/${version}/${version}_bible.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File ${version}.json does not exist.`);
      return;
    }

    console.log('File exists, proceeding to read it...');
    
    // Step 2: Read and parse the JSON file
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const bibleData = JSON.parse(rawData);

    console.log('Parsing and preparing data for insertion...');

    // Step 3: Sanitize and validate the data
    const verses = [];
    Object.keys(bibleData).forEach((book) => {
      Object.keys(bibleData[book]).forEach((chapter) => {
        Object.keys(bibleData[book][chapter]).forEach((verse) => {
          const text = bibleData[book][chapter][verse].trim(); // Trim whitespace
          
          if (text) { // Only add verses with non-empty text
            verses.push({
              book,
              chapter: parseInt(chapter, 10),
              verse: parseInt(verse, 10),
              text,
              version,
            });
          } else {
            console.warn(`Skipping empty verse: ${book} ${chapter}:${verse}`);
          }
        });
      });
    });

    console.log(`Inserting ${verses.length} verses into the database...`);

    // Step 4: Insert the sanitized data into the database
    await BibleVerse.insertMany(verses);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Connect to your MongoDB database and seed the data
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database connected...');
    const version = process.argv[2] || 'KJV'; // Default to KJV if no version is provided
    seedDatabase(version);
  })
  .catch(err => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
