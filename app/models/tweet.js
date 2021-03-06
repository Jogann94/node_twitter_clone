const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: Date,
  content: String,
});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
