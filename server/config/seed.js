/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';

User.find({}).removeAsync()
  .then(() => {
  User.createAsync({
    provider: 'local',
    name: 'Test User',
    email: 'test@example.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin'
  }, {
    provider: 'local',
    role: 'organizer',
    name: 'Elena Organizer',
    email: 'elena@example.com',
    password: 'elena'
  }, {
    provider: 'local',
    role: 'volunteer',
    name: 'Peter Volunteer',
    email: 'peter@example.com',
    password: 'peter'
  })
  .then(() => {
  console.log('finished populating users');
});
});
