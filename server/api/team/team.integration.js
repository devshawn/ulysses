 'use strict';

var app = require('../..');
var should = require('should');
import request from 'supertest';

var newTeam;
var organizer = require('../../auth/authed-agent')('organizer');

describe('Team API:', function() {

  organizer.authorize();

  describe('GET /api/teams', function() {
    var teams;

    beforeEach(function(done) {
      organizer
        .get('/api/teams')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          teams = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      teams.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/teams', function() {
    beforeEach(function(done) {
      organizer
        .post('/api/teams')
        .send({
          problem: 1,
          division: "I",
          teamNumber: 12345,
          teamName: "Toucans",
          city: "Morris",
          state: "Minnesota",
          coachFirstName: "Mr. ",
          coachLastName: "Toucan",
          longTime: "837",
          SponTime: "838"
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newTeam = res.body;
          done();
        });
    });

    it('should respond with the newly created team', function() {
      newTeam.problem.should.equal(1);
      newTeam.division.should.equal('I');
      newTeam.teamNumber.should.equal(12345);
      newTeam.teamName.should.equal('Toucans');
      newTeam.longTime.should.equal('837');
      newTeam.SponTime.should.equal('838');
    });

  });

  describe('GET /api/teams/:id', function() {
    var team;

    beforeEach(function(done) {
      organizer
        .get('/api/teams/' + newTeam._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          team = res.body;
          done();
        });
      });

    afterEach(function() {
      team = {};
    });

    it('should respond with the requested team', function() {
      team.problem.should.equal(1);
      team.division.should.equal('I');
      team.teamNumber.should.equal(12345);
      team.teamName.should.equal('Toucans');
      team.longTime.should.equal('837');
      team.SponTime.should.equal('838');
    });

  });

  describe('PUT /api/teams/:id', function() {
    var updatedTeam;

    beforeEach(function(done) {
      organizer
        .put('/api/teams/' + newTeam._id)
        .send({
          longTime: "900",
          SponTime: "901"
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedTeam = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedTeam = {};
    });

    it('should respond with the updated team', function() {
      updatedTeam.teamName.should.equal('Toucans');
      updatedTeam.longTime.should.equal('900');
      updatedTeam.SponTime.should.equal('901');
    });

  });

  describe('DELETE /api/teams/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      organizer
        .delete('/api/teams/' + newTeam._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when team does not exist', function(done) {
      organizer
        .delete('/api/teams/' + newTeam._id)
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
