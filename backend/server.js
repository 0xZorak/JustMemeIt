const express = require('express');
const cors = require('cors');
const path = require('path');
const voteApi = require('./voteApi');
const twitterAuth = require('./twitterAuth');
const mongoose = require('mongoose');

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

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ error: err.message });
});

