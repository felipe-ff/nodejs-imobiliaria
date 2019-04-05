/**
 * Created by Sebastião Realino on 15/09/2017.
 */
const mongoose = require('mongoose');
//import config from './environment';
//import constants from '../api/utils/constants';
//import logger from '../api/utils/logger';

mongoose.Promise = global.Promise;

//if (process.env.NODE_ENV !== constants.ENV_PRODUCTION) {
  mongoose.set('debug', true);
//}

function connectToMongo() {
  //console.log(process.versions);
  let options = {
    useNewUrlParser: true
  };
  return mongoose.connect('mongodb+srv://felipe-ff:a34571253@cluster-test-dnz1r.gcp.mongodb.net/test?retryWrites=true', options);
}

mongoose.connection.on('error', (err) => {
  //logger.error(`MongoDB connection error: ${err}`);
  console.log(err);
});

mongoose.connection.on('reconnected', () => {
  //logger.info('MongoDB reconnected!');
  console.log('MongoDB reconnected!');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected!');
  connectToMongo();
});

mongoose.connection.once('openUri', () => {
 // if (process.env.NODE_ENV !== constants.ENV_PRODUCTION) {
    console.log('mongodb connection opened!');
 // }
});

module.exports = {
  connectToMongo: connectToMongo,
};
