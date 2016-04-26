'use strict';

import express from 'express';
import _ from 'lodash';
import * as auth from '../auth/auth.service';
import config from '../config/environment';

var router = express.Router();

router.post('/', auth.hasRole('organizer'), function(req, res, next) {
  _.forEach(req.body, function(message) {
    config.mail.transport.sendMail({
      to: config.mail.dry ? 'ulysses-volunteer@localhost' : message.to,
      subject: message.subject,
      text: message.body
    }, function(error, info) {
      if (error) {
        console.error('Failed to send message to %s', message.to);
        return;
      }

      console.log('Sent mail to %s (%s)', message.to, info.messageId);
    });
  });

  res.end();
});

export default router;
