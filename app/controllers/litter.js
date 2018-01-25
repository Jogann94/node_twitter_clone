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
    const usermail = request.auth.credentials.loggedInUser;
    let currentUser = null;
    let isFollowing = false;

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
        isFollowing,
      });
    }

    User.findOne({ email: usermail })
      .populate('following')
      .then((user) => {
        currentUser = user;
        if (!id) {
          setProfileVars(currentUser);
          Tweet.find({ user: currentUser.id })
            .populate('user')
            .then((tweetsFound) => {
              replyProfileView(tweetsFound);
            })
            .catch((err) => {
              reply.redirect('/');
            });
        } else {
          isFollowing = currentUser.following.some(u => u.id === id);
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
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};

exports.followers = {
  handler(request, reply) {
    const id = encodeURIComponent(request.params.userid);

    User.findById(id)
      .populate({
        path: 'followers',
        model: 'User',
        select: {
          firstName: 'firstname',
          lastName: 'lastName',
        },
      })
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

exports.follow = {
  handler(request, reply) {
    const id = encodeURIComponent(request.params.userid);
    const usermail = request.auth.credentials.loggedInUser;
    let currentUser = null;

    User.findOne({ email: usermail })
      .populate('following')
      .then((user) => {
        currentUser = user;
        user.following.push(id);
        user.save();

        return User.findById(id).populate('followers');
      })
      .then((profileUser) => {
        profileUser.followers.push(currentUser.id);
        profileUser.save();
        reply.redirect(request.info.referrer);
      })
      .catch((err) => {
        reply.redirect(request.info.referrer);
      });
  },
};

exports.stopfollow = {
  handler(request, reply) {
    const id = encodeURIComponent(request.params.userid);
    const usermail = request.auth.credentials.loggedInUser;
    let currentUser = null;

    User.findOne({ email: usermail })
      .populate('following')
      .then((user) => {
        currentUser = user;
        const toDelete = user.following.indexOf(u => u.id === id);
        user.following.splice(toDelete, 1);
        user.save();

        return User.findById(id).populate('followers');
      })
      .then((profileUser) => {
        const toDelete = profileUser.followers.indexOf(u => u.id === currentUser.id);
        profileUser.followers.splice(toDelete, 1);
        profileUser.save();
        reply.redirect(request.info.referrer);
      })
      .catch((err) => {
        reply.redirect(request.info.referrer);
      });
  },
};

exports.friendsfeed = {
  handler(request, reply) {
    const usermail = request.auth.credentials.loggedInUser;

    let followingUserIds = null;

    User.findOne({ email: usermail })
      .populate('following')
      .then((user) => {
        followingUserIds = user.following.map(u => u.id);
        return Tweet.find({}).populate('user');
      })
      .then((tweets) => {
        const friendTweets = tweets.filter(t => followingUserIds.includes(t.user.id));

        reply.view('friendsfeed', {
          title: 'Friends Feed',
          tweets: friendTweets,
        });
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};
