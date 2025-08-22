const express = require('express');
const axios = require('axios');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const router = express.Router();

router.use(cors({
  origin: 'http://localhost:3000', 
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

router.get('/login', (req, res) => {
  const { redirect } = req.query;
  req.session.oauthRedirect = redirect || '/vote'; 
  const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=tweet.read users.read offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;
  res.redirect(url);
});


router.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
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


    const userRes = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { 'user.fields': 'profile_image_url,name,username' },
    });


    req.session.xUser = userRes.data.data;

    const { id, name, profile_image_url, username } = userRes.data.data;
    res.redirect(`http://localhost:3000/vote?user_id=${id}&name=${encodeURIComponent(name)}&profile_image_url=${encodeURIComponent(profile_image_url)}`);
  } catch (err) {
    res.status(500).send('Twitter login failed');
  }
});


router.get('/me', (req, res) => {
  if (req.session.xUser) {
    res.json(req.session.xUser);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

module.exports = router;