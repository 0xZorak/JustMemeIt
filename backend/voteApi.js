const express = require('express');
const axios = require('axios');
const Vote = require('./models/Vote');
const multer = require('multer');
const Meme = require('./models/Meme');
const Winner = require('./models/Winner');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const MCP_SERVER_URL = 'http://localhost:3001'; // MCP server endpoint
const upload = multer({ dest: path.join(__dirname, '../uploads') });

// POST /api/vote
router.post('/', async (req, res) => {
  const { memeId, memeName, txHash, voter, votes, value } = req.body;

  if (!memeName) {
    return res.status(400).json({ error: 'Missing or invalid field: memeName' });
  }
  if (!txHash) {
    return res.status(400).json({ error: 'Missing or invalid field: txHash' });
  }
  if (!voter) {
    return res.status(400).json({ error: 'Missing or invalid field: voter' });
  }
  if (typeof votes !== 'number' || votes < 1) {
    return res.status(400).json({ error: 'Missing or invalid field: votes' });
  }
  if (!value) {
    return res.status(400).json({ error: 'Missing or invalid field: value' });
  }

    try {
    const chainId = 1329;
    const to = process.env.VOTE_RECEIVER;
    const from = voter;
    console.log("MCP verify payload:", { txHash, chainId, to, from, value });
    const verifyRes = await axios.post(`${MCP_SERVER_URL}/evm/tx/verify`, {
      txHash,
      chainId,
      to,
      from,
      value,
    });

    if (!verifyRes.data.success) {
      console.error('MCP verification failed:', verifyRes.data);
      return res.status(400).json({ error: 'Transaction not verified', details: verifyRes.data });
    }

    // Save vote to DB
    await Vote.create({ memeId, memeName, voter, txHash, votes });
    // Aggregate total votes for meme
    const totalVotes = await Vote.aggregate([
      { $match: { memeName } },
      { $group: { _id: '$memeName', votes: { $sum: '$votes' } } }
    ]);
    return res.json({ success: true, votes: totalVotes[0]?.votes || votes });
  } catch (err) {
    console.error('MCP verification error:', err.response?.data || err.message, err.stack);
    return res.status(500).json({ error: 'Verification failed', details: err.response?.data || err.message });
  }
});

router.get('/voting-memes', async (req, res) => {
  const memes = await Meme.find({ in_voting: true }).sort({ created_at: -1 });
  const votes = await Vote.aggregate([
    { $group: { _id: "$memeId", votes: { $sum: "$votes" } } }
  ]);
  const voteMap = {};
  votes.forEach(v => { voteMap[v._id?.toString()] = v.votes; });
  const memesWithVotes = memes.map(meme => ({
    ...meme.toObject(),
    votes: voteMap[meme._id.toString()] || 0
  }));
  res.json({ memes: memesWithVotes });
});

// POST /api/upload-meme
router.post('/upload-meme', (req, res, next) => {
  console.log('Upload request received at', new Date());
  next();
}, upload.single('image'), async (req, res) => {
  try {
    const { tweet_id, user_id, username, name, profile_image_url, caption } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    // Ensure user_memes directory exists
    const userMemesDir = path.join(__dirname, '../public/user_memes');
    if (!fs.existsSync(userMemesDir)) fs.mkdirSync(userMemesDir, { recursive: true });

    // Move file to public/user_memes
    const ext = path.extname(req.file.originalname) || '.jpg';
    const newFilename = `${Date.now()}_${req.file.filename}${ext}`;
    const newPath = path.join(userMemesDir, newFilename);
    fs.renameSync(req.file.path, newPath);

    const meme = await Meme.create({
      tweet_id,
      user_id,
      username,
      name,
      profile_image_url,
      caption,
      image_url: `/user_memes/${newFilename}`
    });
    res.json({ success: true, meme });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user-memes/:user_id
router.get('/user-memes/:user_id', async (req, res) => {
  const memes = await Meme.find({ user_id: req.params.user_id }).sort({ created_at: -1 });
  res.json({ memes });
});

// POST /api/send-for-voting
router.post('/send-for-voting', async (req, res) => {
  const { meme_id, caption, username, name } = req.body;
  try {
    const meme = await Meme.findByIdAndUpdate(
      meme_id,
      {
        in_voting: true,
        ...(caption && { caption }),
        ...(username && { username }),
        ...(name && { name }),
      },
      { new: true }
    );
    if (!meme) return res.status(404).json({ error: 'Meme not found' });
    res.json({ success: true, meme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete meme
router.delete('/delete-meme/:meme_id', async (req, res) => {
  try {
    const meme = await Meme.findByIdAndDelete(req.params.meme_id);
    if (!meme) return res.status(404).json({ error: 'Meme not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update meme caption
router.patch('/update-caption/:meme_id', async (req, res) => {
  try {
    const meme = await Meme.findByIdAndUpdate(
      req.params.meme_id,
      { caption: req.body.caption },
      { new: true }
    );
    if (!meme) return res.status(404).json({ error: 'Meme not found' });
    res.json({ success: true, meme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vote/winner
router.get('/winner', async (req, res) => {
  try {
    // Return all winners, latest first
    const winners = await Winner.find().sort({ timestamp: -1 });
    res.json({ winners });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vote/reset-week
router.post('/reset-week', async (req, res) => {
  try {
    // Find winner first
    const memes = await Meme.find({ in_voting: true });
    if (memes.length) {
      const votes = await Vote.aggregate([
        { $group: { _id: "$memeId", votes: { $sum: "$votes" } } }
      ]);
      const voteMap = {};
      votes.forEach(v => { voteMap[v._id?.toString()] = v.votes; });

      let winner = memes[0];
      let maxVotes = voteMap[winner._id.toString()] || 0;
      memes.forEach(meme => {
        const v = voteMap[meme._id.toString()] || 0;
        if (v > maxVotes) {
          winner = meme;
          maxVotes = v;
        }
      });

      // Save winner to Winner collection
      await Winner.create({
        memeId: winner._id,
        avatar: winner.profile_image_url || "/images/avatar.png",
        name: winner.name || winner.username || "unknown",
        username: winner.username || "",
        meme: winner.caption,
        image_url: winner.image_url,
        rank: 1,
        votes: maxVotes,
        xLink: winner.tweet_id ? `https://x.com/i/status/${winner.tweet_id}` : "",
        week: new Date().toISOString().slice(0, 10)
      });
    }

    // Delete all memes in voting and their votes
    const memeIds = memes.map(m => m._id);
    await Vote.deleteMany({ memeId: { $in: memeIds } });
    await Meme.deleteMany({ in_voting: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// This should be LAST among GETs so it doesn't catch everything
router.get('/:memeName', async (req, res) => {
  const { memeName } = req.params;
  const totalVotes = await Vote.aggregate([
    { $match: { memeName } },
    { $group: { _id: '$memeName', votes: { $sum: '$votes' } } }
  ]);
  res.json({ votes: totalVotes[0]?.votes || 0 });
});

module.exports = router;