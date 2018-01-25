const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');

exports.deleteTweet = {
  handler(request, reply) {
    const id = encodeURIComponent(request.params.tweetid);
    Tweet.remove({ _id: request.params.tweetid }).then((err) => {
      reply.redirect('/profile/');
    });
  },
};

exports.createTweet = {
  validate: {
    payload: {
      content: Joi.string()
        .required()
        .max(160),
    },

    options: {
      abortEarly: false,
    },

    failAction(request, reply, source, error) {
      let viewName;
      let replyUser = null;
      let pageTitle = null;
      const ownProfile = null;

      if (request.info.referrer.includes('profile')) {
        viewName = 'profile';
      } else {
        viewName = 'home';
      }

      if (viewName === 'profile') {
        const usermail = request.auth.credentials.loggedInUser;
        User.findOne({ email: usermail })
          .then((user) => {
            replyUser = user;
            pageTitle = `${user.firstName} ${user.lastName}`;
            return Tweet.find({ user: replyUser.id }).populate('user');
          })
          .then((tweetsFound) => {
            reply.view('profile', {
              title: pageTitle,
              user: replyUser,
              ownProfile: true,
              tweets: tweetsFound,
              errors: error.data.details,
            });
          })
          .catch((err) => {
            reply.redirect('/home');
          });
      } else {
        Tweet.find({})
          .populate('user')
          .then((tweets) => {
            reply
              .view('home', {
                title: 'Home',
                errors: error.data.details,
                tweets: tweets.sort((a, b) => b.timestamp - a.timestamp),
              })
              .code(400);
          })
          .catch((err) => {
            reply.redirect('/home');
          });
      }
    },
  },

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
