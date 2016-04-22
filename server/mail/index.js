'use strict';

import express from 'express';
import _ from 'lodash';
import config from '../config/environment';

var router = express.Router();

router.post('/', function(req, res, next) {
  _.forEach(req.body, function(message) {
    config.transport.sendMail({
      // to: message.to,
      to: 'stell124@d.umn.edu',
      subject: message.subject,
      text: message.body
    }, function(error, info) {
      if (error) {
        console.error('Couldn\'t send mail :[');
        return;
      }

      console.log('Sent some mail to %s (message %s)', message.to, info.messageId);
    });
  });

  res.end();
});

export default router;
