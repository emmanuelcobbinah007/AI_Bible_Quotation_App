const mongoose = require('mongoose');

const bibleVerseSchema = new mongoose.Schema({
  book: { type: String, required: true },      // "Genesis"
  chapter: { type: Number, required: true },   // 1
  verse: { type: Number, required: true },     // 1
  text: { type: String, required: true },      // "In the beginning God created the heaven and the earth."
  version: { type: String, required: true },   // "KJV"
});

module.exports = mongoose.model('BibleVerse', bibleVerseSchema);
