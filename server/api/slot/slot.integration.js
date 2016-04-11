
'use strict';

var app = require('../..');
var should = require('should');
import request from 'supertest';

var newSlot;
var organizer = require('../../auth/authed-agent')('organizer');

describe('Slot API:', function() {

  organizer.authorize();

  describe('GET /api/slots', function() {
    var slots;

    beforeEach(function(done) {
      organizer
        .get('/api/slots')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          slots = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      slots.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/slots', function() {
    beforeEach(function(done) {
      organizer
        .post('/api/slots')
        .send({
          start: 500,
          end: 800,
          volunteers: []
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newSlot = res.body;
          done();
        });
    });

    it('should respond with the newly created slot', function() {
      newSlot.start.should.equal(500);
      newSlot.end.should.equal(800);
    });

  });

  describe('GET /api/slots/:id', function() {
    var slot;

    beforeEach(function(done) {
      organizer
        .get('/api/slots/' + newSlot._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          slot = res.body;
          done();
        });
    });

    afterEach(function() {
      slot = {};
    });

    it('should respond with the requested slot', function() {
      slot.start.should.equal(500);
      slot.end.should.equal(800);
    });

  });

  describe('PUT /api/slots/:id', function() {
    var updatedSlot;

    beforeEach(function(done) {
      organizer
        .put('/api/slots/' + newSlot._id)
        .send({
          start: '600',
          end: '700'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedSlot = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSlot = {};
    });

    it('should respond with the updated slot', function() {
      updatedSlot.start.should.equal(600);
      updatedSlot.end.should.equal(700);
    });

  });

  describe('DELETE /api/slots/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      organizer
        .delete('/api/slots/' + newSlot._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when slot does not exist', function(done) {
      organizer
        .delete('/api/slots/' + newSlot._id)
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
