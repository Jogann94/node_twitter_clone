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

exports.createTweet = {
  handler(request, reply) {
    const usermail = request.auth.credentials.loggedInUser;
    User.findOne({ email: usermail })
      .then((userFound) => {
        const tweet = new Tweet();
        tweet.user = userFound._id;
        tweet.timestamp = Date.now();
        tweet.content = request.payload.tweetContent;

        return tweet.save();
      })
      .then((newTweet) => {
        reply.redirect(request.info.referrer);
      })
      .catch((err) => {
        reply.redirect(request.info.referrer);
      });
  },
};
