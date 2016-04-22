'use strict';

var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/ulysses-dev'
  },

  // Seed database on startup
  seedDB: true,

  // Email transport (locally in dev)
  transport: nodemailer.createTransport(sendmailTransport())

};
