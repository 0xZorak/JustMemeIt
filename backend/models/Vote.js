const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  memeId: { type: mongoose.Schema.Types.ObjectId, ref: "Meme" }, // <-- add this line
  memeName: String,
  voter: String,
  txHash: String,
  votes: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vote', voteSchema);