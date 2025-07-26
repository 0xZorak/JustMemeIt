const express = require('express');
const cors = require('cors');
const twitterAuth = require('./twitterAuth');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use('/auth/x', twitterAuth);

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});

