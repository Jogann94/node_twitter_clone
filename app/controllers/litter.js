const Tweet = require('../models/tweet');
const User = require('../models/user');

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
          return Tweet.find({ 'user.id': userFound.id });
        })
        .then((foundTweets) => {
          replyProfileView(foundTweets);
        })
        .catch((err) => {
          reply.redirect('/');
        });
    } else {
      User.findById(id)
        .then((userFound) => {
          setProfileVars(userFound);
          return Tweet.find({ 'user.id': userFound.id });
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
