const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  memeId: mongoose.Schema.Types.ObjectId,
  avatar: String,
  name: String,
  username: String,
  meme: String,
  image_url: String,
  rank: Number,
  votes: Number,
  xLink: String,
  week: String, // e.g. "2025-08-10"
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Winner', winnerSchema);