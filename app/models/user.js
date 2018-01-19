const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  followers: [this],
  following: [this],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
