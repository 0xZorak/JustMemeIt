const express = require('express');
const axios = require('axios');
const Vote = require('./models/Vote.js');
const Meme = require('./models/Meme.js');
const Winner = require('./models/Winner.js');
const { mintNFT } = require('./utils/mintNFT.js');
const { uploadMemeAndMetadataToIPFS } = require('./utils/pinataNFT.js');
// const { listNFTOnMagicEden } = require('./utils/magicEden.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const MCP_SERVER_URL = 'http://localhost:3001'; // MCP server endpoint

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// POST /api/vote
router.post('/', async (req, res) => {
  const { memeId, memeName, txHash, voter, votes, value, voter_wallet_address } = req.body;

  if (!memeName) return res.status(400).json({ error: 'Missing or invalid field: memeName' });
  if (!txHash) return res.status(400).json({ error: 'Missing or invalid field: txHash' });
  if (!voter) return res.status(400).json({ error: 'Missing or invalid field: voter' });
  if (typeof votes !== 'number' || votes < 1) return res.status(400).json({ error: 'Missing or invalid field: votes' });
  if (!value) return res.status(400).json({ error: 'Missing or invalid field: value' });

  try {
    const chainId = 1329;
    const to = process.env.VOTE_RECEIVER;
    const from = voter;
    console.log("MCP verify payload:", { txHash, chainId, to, from, value });

    const verifyRes = await axios.post(`${MCP_SERVER_URL}/evm/tx/verify`, {
      txHash, chainId, to, from, value,
    });

    if (!verifyRes.data.success) {
      console.error('MCP verification failed:', verifyRes.data);
      return res.status(400).json({ error: 'Transaction not verified', details: verifyRes.data });
    }

    await Vote.create
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
  const votes = await Vote.aggregate([{ $group: { _id: "$memeId", votes: { $sum: "$votes" } } }]);
  const voteMap = {};
  votes.forEach(v => { voteMap[v._id?.toString()] = v.votes; });

  const memesWithVotes = memes.map(meme => ({
    ...meme.toObject(),
    votes: voteMap[meme._id.toString()] || 0
  }));
  res.json({ memes: memesWithVotes });
});

router.post('/upload-meme', upload.single('image'), async (req, res) => {
  try {
    const { tweet_id, user_id, username, name, profile_image_url, caption, creator_wallet_address } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const userMemesDir = path.join(__dirname, '../public/user_memes');
    if (!fs.existsSync(userMemesDir)) fs.mkdirSync(userMemesDir, { recursive: true });

    const ext = path.extname(req.file.originalname) || '.jpg';
    const newFilename = `${Date.now()}_${req.file.filename}${ext}`;
    const newPath = path.join(userMemesDir, newFilename);
    fs.renameSync(req.file.path, newPath);

    const meme = await Meme.create({
      tweet_id, user_id, username, name, profile_image_url, caption,
      image_url: `/user_memes/${newFilename}`,
      creator_wallet_address
    });
    res.json({ success: true, meme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user-memes/:user_id', async (req, res) => {
  const memes = await Meme.find({ user_id: req.params.user_id }).sort({ created_at: -1 });
  res.json({ memes });
});

router.post('/send-for-voting', async (req, res) => {
  const { meme_id, caption, username, name, creator_wallet_address } = req.body;
  if (!creator_wallet_address) return res.status(400).json({ error: 'Missing creator_wallet_address' });

  try {
    const meme = await Meme.findByIdAndUpdate(
      meme_id,
      {
        in_voting: true,
        ...(caption && { caption }),
        ...(username && { username }),
        ...(name && { name }),
        creator_wallet_address,
      },
      { new: true }
    );
    if (!meme) return res.status(404).json({ error: 'Meme not found' });
    res.json({ success: true, meme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete-meme/:meme_id', async (req, res) => {
  try {
    const meme = await Meme.findByIdAndDelete(req.params.meme_id);
    if (!meme) return res.status(404).json({ error: 'Meme not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/update-caption/:meme_id', async (req, res) => {
  try {
    const meme = await Meme.findByIdAndUpdate(req.params.meme_id, { caption: req.body.caption }, { new: true });
    if (!meme) return res.status(404).json({ error: 'Meme not found' });
    res.json({ success: true, meme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/winner', async (req, res) => {
  try {
    const winners = await Winner.find().sort({ timestamp: -1 });
    res.json({ winners });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset-week', async (req, res) => {
  try {
    const memes = await Meme.find({ in_voting: true });
    if (memes.length) {
      const votes = await Vote.aggregate([{ $group: { _id: "$memeId", votes: { $sum: "$votes" } } }]);
      const voteMap = {};
      votes.forEach(v => { voteMap[v._id?.toString()] = v.votes; });

      let winner = memes[0];
      let maxVotes = voteMap[winner._id.toString()] || 0;
      memes.forEach(meme => {
        const v = voteMap[meme._id.toString()] || 0;
        if (v > maxVotes) { winner = meme; maxVotes = v; }
      });

      const votesForWinner = await Vote.find({ memeId: winner._id });
      const voterAddresses = votesForWinner.map(v => v.voter);

      const winnerMemeDoc = await Meme.findById(winner._id);

      await Winner.create({
        memeId: winner._id,
        avatar: winner.profile_image_url || "/images/avatar.png",
        name: winner.name || winner.username || "unknown",
        username: winner.username || "",
        meme: winner.caption,
        image_url: winner.image_url,
        creator_wallet_address: winnerMemeDoc?.creator_wallet_address || "",
        voter_wallet_addresses: voterAddresses,
        rank: 1,
        votes: maxVotes,
        xLink: winner.tweet_id ? `https://x.com/i/status/${winner.tweet_id}` : "",
        week: new Date().toISOString().slice(0, 10)
      });

      const { metadataCID, metadataUrl, imageCID, imageUrl } = await handleWinnerNFT(winner);
      console.log("Minted NFT for winner:", { metadataCID, metadataUrl, imageCID, imageUrl });

      const recipientWallet = winnerMemeDoc?.creator_wallet_address;
      const voterWallets = voterAddresses.filter(addr => addr && addr !== recipientWallet); // avoid double mint

      if (recipientWallet && metadataUrl) {
        try {
          const name = winner.name || winner.username || "Meme Winner";
          const image = winner.image_url;
          const metadataUri = metadataUrl;

          const receipt = await mintNFT(recipientWallet, metadataUri, image, name, 'reset');
          console.log("NFT Minted! Tx:", receipt.hash);

          // Get tokenId from receipt (assumes contract emits Transfer event)
          // const transferEvent = receipt.logs.find(
          //   log => log.topics[0] === ethers.id("Transfer(address,address,uint256)")
          // );
          // let tokenId = null;
          // if (transferEvent) {
          //   tokenId = ethers.toBigInt(transferEvent.topics[3]).toString();
          // }
          // if (tokenId) {
          //   await listNFTOnMagicEden({
          //     contractAddress: process.env.MEMEITWINNER_CONTRACT,
          //     tokenId,
          //     priceInSEI: process.env.DEFAULT_LIST_PRICE_SEI,
          //   });
          // } else {
          //   console.warn("Could not extract tokenId from mint receipt, NFT not listed.");
          // }

        } catch (err) {
          console.error("NFT minting failed (creator):", err);
        }
        // Mint and list for voters
        for (const voter of voterWallets) {
          try {
            const name = voter.name || voter.username || "Meme Winner";
            const image = winner.image_url;
            const receipt = await mintNFT(voter, metadataUrl, image, name, 'reset');
            console.log(`NFT Minted for voter ${voter}! Tx:`, receipt.hash);

            // Extract tokenId and list
            // const transferEvent = receipt.logs.find(
            //   log => log.topics[0] === ethers.id("Transfer(address,address,uint256)")
            // );
            // let tokenId = null;
            // if (transferEvent) {
            //   tokenId = ethers.toBigInt(transferEvent.topics[3]).toString();
            // }
            // if (tokenId) {
            //   await listNFTOnMagicEden({
            //     contractAddress: process.env.MEMEITWINNER_CONTRACT,
            //     tokenId,
            //     priceInSEI: process.env.DEFAULT_LIST_PRICE_SEI,
            //   });
            // } else {
            //   console.warn(`Could not extract tokenId for voter ${voter}, NFT not listed.`);
            // }

          } catch (err) {
            console.error(`NFT minting failed for voter ${voter}:`, err);
          }
        }
      } else {
        console.error("Missing recipientWallet or metadataUrl for NFT minting");
      }

      // Clean up votes and memes after winner is processed
      const memeIds = memes.map(m => m._id);
      await Vote.deleteMany({ memeId: { $in: memeIds } });
      await Meme.deleteMany({ in_voting: true });
      return res.json({ success: true });
    } else {
      await Vote.deleteMany({});
      await Meme.deleteMany({ in_voting: true });
      return res.json({ success: true, message: "No memes in voting, cleanup done." });
    }
  } catch (err) {
    console.error('Weekly reset failed:', err);
    res.status(500).json({ error: err.message });
  }
});

async function getWinnerDetails() {
  const winner = await Winner.findOne().sort({ timestamp: -1 });
  if (!winner) return null;
  return { image_url: winner.image_url, creator_wallet_address: winner.creator_wallet_address };
}

router.get('/winner-details', async (req, res) => {
  const details = await getWinnerDetails();
  if (!details) return res.status(404).json({ error: "No winner found" });
  res.json(details);
});

router.get('/:memeName', async (req, res) => {
  const { memeName } = req.params;
  const totalVotes = await Vote.aggregate([
    { $match: { memeName } },
    { $group: { _id: '$memeName', votes: { $sum: '$votes' } } }
  ]);
  res.json({ votes: totalVotes[0]?.votes || 0 });
});

module.exports = router;

async function handleWinnerNFT(winner) {
  const imagePath = path.join(__dirname, '../public', winner.image_url);
  const { metadataCID, metadataUrl, imageCID, imageUrl } = await uploadMemeAndMetadataToIPFS({
    imagePath,
    title: winner.name || "Meme Winner",
    description: winner.meme,
    creatorWallet: winner.creator_wallet_address
  });
  return { metadataCID, metadataUrl, imageCID, imageUrl };
}
