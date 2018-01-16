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
      reply.view('profile', {
        title: pageTitle,
        user: userToLoad,
        isOwn: ownProfile,
        tweets,
      });
    }

    if (!id) {
      const usermail = request.auth.credentials.loggedInUser;
      User.findOne({ email: usermail })
        .then((userFound) => {
          setProfileVars(userFound);
          return Tweet.find({ user: userFound.id }).populate('user');
        })
        .then((foundTweets) => {
          const profileTweets = foundTweets
            .filter(t => t.user.email === userToLoad.email)
            .sort('-timestamp user.firstName user.lastName');
          replyProfileView(profileTweets);
        })
        .catch((err) => {
          reply.redirect('/');
        });
    } else {
      User.findById(id)
        .then((userFound) => {
          setProfileVars(userFound);
          return Tweet.find({ user: id });
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
