const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  tweet_id: String,
  user_id: String,
  username: String,
  name: String,
  profile_image_url: String,
  caption: String,
  image_url: String,
  created_at: { type: Date, default: Date.now },
  in_voting: { type: Boolean, default: false }
});

module.exports = mongoose.model('Meme', memeSchema);