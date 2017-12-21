const User = require('../models/user');

exports.home = {
  handler(request, reply) {
    reply.view('home', {
      title: 'Litter',
    });
  },
};
