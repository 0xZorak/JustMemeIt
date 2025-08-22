const mongoose = require('mongoose');

const NFTSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  owner: { type: String, required: true, index: true },
  image: { type: String, required: true },
  name: { type: String, required: true },
  metadataUri: { type: String },
  mintedAt: { type: Date, default: Date.now },
  source: { type: String }, // e.g. 'reset', 'memeai'
});

module.exports = mongoose.model('NFT', NFTSchema);