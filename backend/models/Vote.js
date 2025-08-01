const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  memeName: String,
  voter: String,
  txHash: String,
  votes: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vote', voteSchema);