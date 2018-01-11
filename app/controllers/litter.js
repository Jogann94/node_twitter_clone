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
    User.findById(id)
      .then((foundUser) => {
        const pageTitle = `${foundUser.firstName} ${foundUser.lastName}`;
        const ownProfile = foundUser.email === request.auth.credentials.loggedInUser;

        reply.view('profile', { title: pageTitle, user: foundUser, isOwn: ownProfile });
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};
