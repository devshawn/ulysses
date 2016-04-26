'use strict';

var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:     process.env.OPENSHIFT_NODEJS_IP ||
          process.env.IP ||
          undefined,

  // Server port
  port:   process.env.OPENSHIFT_NODEJS_PORT ||
          process.env.PORT ||
          8080,

  mail: {
    // Enable to prevent actually sending:
    dry: false,
    // Transport (locally in dev):
    transport: nodemailer.createTransport(sendmailTransport())
  },

  // MongoDB connection options
  mongo: {
    uri:  process.env.MONGOLAB_URI ||
          process.env.MONGOHQ_URL ||
          process.env.OPENSHIFT_MONGODB_DB_URL +
          process.env.OPENSHIFT_APP_NAME ||
          'mongodb://localhost/ulysses'
  }
};
