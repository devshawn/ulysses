
'use strict';

var app = require('../..');
var should = require('should');
import request from 'supertest';

var newLocation;
var user = require('../../auth/authed-agent')('user');

describe('location API:', function() {

  user.authorize();

  describe('GET /api/locations', function() {
    var locations;

    beforeEach(function(done) {
      user
        .get('/api/locations')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          locations = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      locations.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/locations', function() {
    beforeEach(function(done) {
      user
        .post('/api/locations')
        .send({
          name: 'New location'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newLocation = res.body;
          done();
        });
    });

    it('should respond with the newly created location', function() {
      newLocation.name.should.equal('New location');
    });

  });

  describe('GET /api/locations/:id', function() {
    var location;

    beforeEach(function(done) {
      user
        .get('/api/locations/' + newLocation._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          location = res.body;
          done();
        });
    });

    afterEach(function() {
      location = {};
    });

    it('should respond with the requested location', function() {
      location.name.should.equal('New location');
    });

  });

  describe('PUT /api/locations/:id', function() {
    var updatedLocation;

    beforeEach(function(done) {
      user
        .put('/api/locations/' + newLocation._id)
        .send({
          name: 'Updated location'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedLocation = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedLocation = {};
    });

    it('should respond with the updated location', function() {
      updatedLocation.name.should.equal('Updated location');
    });

  });

  describe('DELETE /api/locations/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      user
        .delete('/api/locations/' + newLocation._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when location does not exist', function(done) {
      user
        .delete('/api/locations/' + newLocation._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
