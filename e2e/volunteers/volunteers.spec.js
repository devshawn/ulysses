'use strict';

var config = browser.params;
var UserModel = require(config.serverConfig.root + '/server/api/user/user.model');

describe('Volunteer View', function() {
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
    page = require('./volunteers.po');
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


  it('should login the user as an organizer', function() {
    loginPage.login(testOrganizer);

    var navbar = require('../components/navbar/navbar.po');

    expect(browser.getCurrentUrl()).toBe(config.baseUrl + '/');
    expect(navbar.navbarAccountGreeting.getText()).toBe('Hello ' + testOrganizer.name);

  });

  describe(' with the logged in organizer', function() {
    beforeEach(function(done) {
      loadPage();
      browser.wait(function() {
        return browser.executeScript('return !!window.angular');
      }, 5000).then(done);
    });

    /*it('should include a volunteers page without any uploaded volunteers', function() {
      browser.get(config.baseUrl + '/volunteers');
      expect(browser.getCurrentUrl()).toBe(config.baseUrl + '/volunteers');
      expect(page.panelBody.getText()).toBe('Search for a specific volunteer:');
    });*/
  });
});
