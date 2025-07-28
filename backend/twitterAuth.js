const express = require('express');
const axios = require('axios');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const router = express.Router();

router.use(cors({
  origin: 'http://localhost:3000', // your React app origin
  credentials: true,
}));

router.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));

const CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const REDIRECT_URI = process.env.TWITTER_REDIRECT_URI;

// Step 1: Redirect user to Twitter for login
router.get('/login', (req, res) => {
  const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=tweet.read users.read offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;
  res.redirect(url);
});

// Step 2: Twitter redirects back with code
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    // Exchange code for access token
    const tokenRes = await axios.post('https://api.twitter.com/2/oauth2/token', null, {
      params: {
        code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: 'challenge',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    });

    const { access_token } = tokenRes.data;

    // Get user info
    const userRes = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { 'user.fields': 'profile_image_url,name,username' },
    });

    // Save user in session (or send as response)
    req.session.xUser = userRes.data.data;

    // Redirect back to frontend with user info in query (or use session/cookie)
    res.redirect(`http://localhost:3000/user?name=${encodeURIComponent(userRes.data.data.name)}&profile_image_url=${encodeURIComponent(userRes.data.data.profile_image_url)}`);
  } catch (err) {
    res.status(500).send('Twitter login failed');
  }
});

// Optional: Endpoint to get user info from session
router.get('/me', (req, res) => {
  if (req.session.xUser) {
    res.json(req.session.xUser);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

module.exports = router;