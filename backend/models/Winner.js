const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  memeId: mongoose.Schema.Types.ObjectId,
  avatar: String,
  name: String,
  username: String,
  meme: String,
  image_url: String,
  creator_wallet_address: String,
  rank: Number,
  votes: Number,
  xLink: String,
  week: String,
  timestamp: { type: Date, default: Date.now },
  voter_wallet_addresses: [String]
});

module.exports = mongoose.model('Winner', winnerSchema);