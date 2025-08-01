const express = require('express');
const cors = require('cors');
const voteApi = require('./voteApi');
const twitterAuth = require('./twitterAuth');
const mongoose = require('mongoose');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use('/auth/x', twitterAuth);
app.use('/api/vote', voteApi);

mongoose.connect('mongodb://localhost:27017/memeit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

