const User = require('../models/user');
const Tweet = require('../models/tweet');

exports.home = {
  handler(request, reply) {
    Tweet.find({})
      .populate('user')
      .sort('-timestamp user.firstName user.lastName')
      .then((tweets) => {
        reply.view('home', {
          title: 'Litter',
          tweets,
        });
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};

exports.profile = {
  handler(request, reply) {
    const id = encodeURIComponent(request.params.userid);
    let userToLoad;
    let pageTitle = null;
    let ownProfile = null;

    function setProfileVars(userFound) {
      userToLoad = userFound;
      pageTitle = `${userFound.firstName} ${userFound.lastName}`;
      ownProfile = userFound.email === request.auth.credentials.loggedInUser;
    }

    function replyProfileView(tweets) {
      const profileTweets = tweets.sort((a, b) => b.timestamp - a.timestamp);

      reply.view('profile', {
        title: pageTitle,
        user: userToLoad,
        ownProfile,
        tweets: profileTweets,
      });
    }

    if (!id) {
      const usermail = request.auth.credentials.loggedInUser;
      User.findOne({ email: usermail })
        .then((userFound) => {
          setProfileVars(userFound);
          return Tweet.find({ user: userFound.id }).populate('user');
        })
        .then((tweetsFound) => {
          replyProfileView(tweetsFound);
        })
        .catch((err) => {
          reply.redirect('/');
        });
    } else {
      User.findById(id)
        .then((userFound) => {
          setProfileVars(userFound);
          return Tweet.find({ user: id }).populate('user');
        })
        .then((tweetsFound) => {
          replyProfileView(tweetsFound);
        })
        .catch((err) => {
          reply.redirect('/');
        });
    }
  },
};

exports.followers = {
  handler(request, reply) {
    const id = encodeURIComponent(request.params.userid);

    User.findById(id)
      .populate('followers')
      .then((userFound) => {
        reply.view('userfeed', { users: userFound.followers });
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};

exports.following = {
  handler(request, reply) {
    const id = encodeURIComponent(request.params.userid);

    User.findById(id)
      .populate('following')
      .then((userFound) => {
        reply.view('userfeed', { users: userFound.following });
      })
      .catch((err) => {});
  },
};
