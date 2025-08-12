const express = require('express');
const cors = require('cors');
const path = require('path');
const voteApi = require('./voteApi');
const twitterAuth = require('./twitterAuth');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/auth/x', twitterAuth);
app.use('/api/vote', voteApi);
app.use('/user_memes', express.static(path.join(__dirname, '../public/user_memes')));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

// Every Saturday at 11:59pm
// cron.schedule('59 23 * * 6', async () => {
cron.schedule('*/10 * * * *', async () => {
  try {
    await axios.post('http://localhost:4000/api/vote/reset-week');
    console.log('Weekly meme reset completed!');
  } catch (err) {
    console.error('Weekly reset failed:', err.message);
  }
});

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ error: err.message });
});

