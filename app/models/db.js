const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let dbURI = 'mongodb://localhost/litter';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
  if (process.env.NODE_ENV !== 'production') {
    const seeder = require('mongoose-seeder');
    const User = require('./user');
    const Tweet = require('./tweet');
    const data = require('./initdata.json');
    let dataFromDB = null;
    seeder
      .seed(data, { dropDatabase: false, dropCollections: true })
      .then((dbData) => {
        dataFromDB = dbData;
        console.log('preloading Test Data');
        console.log(dbData);
        return User.find({}).populate(['followers', 'following']);
      })
      .then((usersFound) => {
        const marge = usersFound.find(user => user.email === 'marge@simpson.com');
        const homer = usersFound.find(user => user.email === 'homer@simpson.com');
        const bart = usersFound.find(user => user.email === 'bart@simpson.com');

        bart.followers.push(marge._id, homer._id);
        marge.following.push(bart._id, homer._id);
        homer.following.push(bart._id);

        homer.followers.push(marge._id);

        usersFound.forEach((user) => {
          user.save();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

mongoose.connection.on('error', (err) => {
  console.log(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
