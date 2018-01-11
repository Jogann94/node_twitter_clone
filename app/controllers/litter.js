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
