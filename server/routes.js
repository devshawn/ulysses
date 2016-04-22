/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below
  app.use('/api/locations', require('./api/location'));
  app.use('/api/teams', require('./api/team'));
  app.use('/api/slots', require('./api/slot'));
  app.use('/api/jobs', require('./api/job'));
  app.use('/api/volunteers', require('./api/volunteer'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/upload', require('./api/upload'));

  app.use('/auth', require('./auth'));
  app.use('/mail', require('./mail'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
