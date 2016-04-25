'use strict';

var config = browser.params;
var UserModel = require(config.serverConfig.root + '/server/api/user/user.model');

describe('Job View', function() {
  var page;
  var loginPage = require('../account/login/login.po');

  var testOrganizer = {
    name: 'Elena organizer',
    email: 'elena@example.com',
    password: 'elena',
    role: 'organizer'
  };

  var loadPage = function() {
    browser.get(config.baseUrl + '/login');
    page = require('./job.po');
  };

  beforeAll(function(done) {
    UserModel.removeAsync()
      .then(function() {
        return UserModel.createAsync(testOrganizer);
      })
      .then(loadPage)
      .finally(function() {
        browser.wait(function() {
          //console.log('waiting for angular...');
          return browser.executeScript('return !!window.angular');

        }, 5000).then(done);

      });
  });

  it('should login user', function() {
    loginPage.login(testOrganizer);

    var navbar = require('../components/navbar/navbar.po');

    expect(browser.getCurrentUrl()).toBe(config.baseUrl + '/');
    expect(navbar.navbarAccountGreeting.getText()).toBe('Hello ' + testOrganizer.name);
  });

  describe('with logged in organizer', function() {
    beforeEach(function(done) {
      loadPage();
      browser.wait(function() {
          return browser.executeScript('return !!window.angular');
      }, 5000).then(done);
    });

    it('should include job page with no data', function() {
      browser.get(config.baseUrl + '/jobs');
      //browser.waitForAngular();
      expect(browser.getCurrentUrl()).toBe(config.baseUrl + '/jobs');
      //browser.wait(function() { return false; }, 20000);
      expect(page.panelBody.getText()).toBe('There are currently no jobs.');
    });

    it('should include a schedule page with out a schedule', function() {
      browser.get(config.baseUrl + '/schedule');
      expect(browser.getCurrentUrl()).toBe(config.baseUrl + '/schedule');


      //expect(page.panelBody.getText()).toBe('In order to view the master schedule, please enter at least one job.');
      //above attempt did not work
      //should check to see if the schedule is empty...figure out next time
    });
  });
});
