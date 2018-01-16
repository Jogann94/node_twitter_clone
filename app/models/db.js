const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let dbURI = 'mongodb://localhost/litter';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGODB_URI;
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
  if (process.env.NODE_ENV !== 'production') {
    const seeder = require('mongoose-seeder');
    const User = require('./user');
    const Tweet = require('./tweet');
    const data = require('./initdata.json');

    seeder
      .seed(data, { dropDatabase: false, dropCollections: true })
      .then((dbData) => {
        console.log('preloading Test Data');
        console.log(dbData);
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
