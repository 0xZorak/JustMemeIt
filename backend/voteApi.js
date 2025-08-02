const express = require('express');
const axios = require('axios');
const Vote = require('./models/Vote');
const router = express.Router();

const MCP_SERVER_URL = 'http://localhost:3001'; // MCP server endpoint

// POST /api/vote
router.post('/', async (req, res) => {
  const { memeName, txHash, voter, votes, value } = req.body;

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
    await Vote.create({ memeName, voter, txHash, votes });
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

// GET /api/vote/:memeName
router.get('/:memeName', async (req, res) => {
  const { memeName } = req.params;
  const totalVotes = await Vote.aggregate([
    { $match: { memeName } },
    { $group: { _id: '$memeName', votes: { $sum: '$votes' } } }
  ]);
  res.json({ votes: totalVotes[0]?.votes || 0 });
});

module.exports = router;