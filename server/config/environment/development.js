'use strict';

var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

// Development specific configuration
// ==================================
module.exports = {

  mail: {
    // Enable to prevent actually sending:
    dry: true,
    // Transport (locally in dev):
    transport: nodemailer.createTransport(sendmailTransport())
  },

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/ulysses-dev'
  },

  // Seed database on startup
  seedDB: true,

};
