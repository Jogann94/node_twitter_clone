const Accounts = require('./app/controllers/accounts');
const Assets = require('./app/controllers/assets');
const Litter = require('./app/controllers/litter');
const TweetController = require('./app/controllers/tweetcontroller');

module.exports = [
  { method: 'GET', path: '/', config: Accounts.main },
  { method: 'GET', path: '/signup', config: Accounts.signup },
  { method: 'GET', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/login', config: Accounts.authenticate },
  { method: 'POST', path: '/register', config: Accounts.register },
  { method: 'GET', path: '/logout', config: Accounts.logout },
  { method: 'GET', path: '/settings', config: Accounts.viewSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },

  { method: 'GET', path: '/home', config: Litter.home },
  { method: 'GET', path: '/profile/{userid?}', config: Litter.profile },
  { method: 'GET', path: '/followers/{userid}', config: Litter.followers },
  { method: 'GET', path: '/following/{userid}', config: Litter.following },
  { method: 'POST', path: '/follow/{userid}', config: Litter.follow },
  { method: 'POST', path: '/stopfollow/{userid}', config: Litter.stopfollow },
  { method: 'GET', path: '/friendsfeed', config: Litter.friendsfeed },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

  {
    method: 'GET',
    path: '/deleteTweet/{tweetid}',
    config: TweetController.deleteTweet,
  },

  {
    method: 'POST',
    path: '/createTweet/{view}',
    config: TweetController.createTweet,
  },
];
