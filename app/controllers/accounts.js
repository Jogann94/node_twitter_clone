const User = require('../models/user');
const Joi = require('joi');

exports.main = {
  auth: false,
  handler(request, reply) {
    reply.view('main', { title: 'Welcome to Litter' });
  },
};

exports.signup = {
  auth: false,
  handler(request, reply) {
    reply.view('signup', { title: 'Sign up for Litter' });
  },
};

exports.login = {
  auth: false,
  handler(request, reply) {
    reply.view('login', { title: 'Login to Litter' });
  },
};

exports.register = {
  auth: false,

  validate: {
    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
    },

    options: {
      abortEarly: false,
    },

    failAction(request, reply, source, error) {
      reply
        .view('signup', {
          title: 'Sign up error',
          errors: error.data.details,
        })
        .code(400);
    },
  },

  handler(request, reply) {
    const user = new User(request.payload);

    user
      .save()
      .then((newUser) => {
        reply.redirect('/login');
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};

exports.authenticate = {
  auth: false,

  validate: {
    payload: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
    },

    options: {
      abortEarly: false,
    },

    failAction(request, reply, source, error) {
      reply
        .view('login', {
          title: 'Sign in error',
          errors: error.data.details,
        })
        .code(400);
    },
  },

  handler(request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email })
      .then((foundUser) => {
        if (foundUser && foundUser.password === user.password) {
          request.cookieAuth.set({
            loggedIn: true,
            loggedInUser: user.email,
          });
          reply.redirect('/home');
        } else {
          reply.redirect('/signup');
        }
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};

exports.logout = {
  auth: false,
  handler(request, reply) {
    request.cookieAuth.clear();
    reply.redirect('/');
  },
};

exports.viewSettings = {
  handler(request, reply) {
    const userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail })
      .then((foundUser) => {
        reply.view('settings', { title: 'Edit Account Settings', user: foundUser });
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};

exports.updateSettings = {
  validate: {
    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
    },

    options: {
      abortEarly: false,
    },

    failAction(request, reply, source, error) {
      reply
        .view('signup', {
          title: 'Sign up error',
          errors: error.data.details,
        })
        .code(400);
    },
  },

  handler(request, reply) {
    const editedUser = request.payload;
    const loggedInUserEmail = request.auth.credentials.loggedInUser;

    User.findOne({ email: loggedInUserEmail })
      .then((user) => {
        user.firstName = editedUser.firstName;
        user.lastName = editedUser.lastName;
        user.email = editedUser.email;
        user.password = editedUser.password;
        return user.save();
      })
      .then((user) => {
        reply.view('settings', { title: 'Edit Account Settings', user });
      })
      .catch((err) => {
        reply.redirect('/');
      });
  },
};
