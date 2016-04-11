
'use strict';

var app = require('../..');
var should = require('should');
import request from 'supertest';

var newJob;
var organizer = require('../../auth/authed-agent')('organizer');

describe('Job API:', function() {

  organizer.authorize();

  describe('GET /api/jobs', function() {
    var jobs;

    beforeEach(function(done) {
      organizer
        .get('/api/jobs')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          jobs = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      jobs.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/jobs', function() {
    beforeEach(function(done) {
      organizer
        .post('/api/jobs')
        .send({
          title: 'New Job',
          description: 'This is the brand new job!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newJob = res.body;
          done();
        });
    });

    it('should respond with the newly created job', function() {
      newJob.title.should.equal('New Job');
      newJob.description.should.equal('This is the brand new job!!!');
    });

  });

  describe('GET /api/jobs/:id', function() {
    var job;

    beforeEach(function(done) {
      organizer
        .get('/api/jobs/' + newJob._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          job = res.body;
          done();
        });
    });

    afterEach(function() {
      job = {};
    });

    it('should respond with the requested job', function() {
      job.title.should.equal('New Job');
      job.description.should.equal('This is the brand new job!!!');
    });

  });

  describe('PUT /api/jobs/:id', function() {
    var updatedJob;

    beforeEach(function(done) {
      organizer
        .put('/api/jobs/' + newJob._id)
        .send({
          title: 'Updated Job',
          description: 'This is the updated job!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedJob = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedJob = {};
    });

    it('should respond with the updated job', function() {
      updatedJob.title.should.equal('Updated Job');
      updatedJob.description.should.equal('This is the updated job!!!');
    });

  });

  describe('DELETE /api/jobs/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      organizer
        .delete('/api/jobs/' + newJob._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when job does not exist', function(done) {
      organizer
        .delete('/api/jobs/' + newJob._id)
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
