const Tweet = require('../models/tweet');
const User = require('../models/user');

exports.deleteTweet = {
  handler(request, reply) {
    const id = encodeURIComponent(request.params.tweetid);
    Tweet.remove({ _id: request.params.tweetid }).then((err) => {
      reply.redirect('/profile/');
    });
  },
};
