'use strict';

describe('Controller: JobCtrl', function () {

  // load the controller's module
  beforeEach(module('ulyssesApp'));

  var JobCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    JobCtrl = $controller('JobCtrl', {
      $scope: scope
    });
  }));

  // Test isSuccess
  it('should know if successful - true', function () {
    JobCtrl.success = true;
    expect(JobCtrl.isSuccess()).toEqual(true);
  });

  it('should know if successful - false', function () {
    JobCtrl.success = false;
    expect(JobCtrl.isSuccess()).toEqual(false);
  });

  // Test isError
  it('should know if error exists - true', function () {
    JobCtrl.error = true;
    expect(JobCtrl.isError()).toEqual(true);
  });

  it('should know if error exists - false', function () {
    JobCtrl.error = false;
    expect(JobCtrl.isError()).toEqual(false);
  });

  // Test areThereLocations
  it('should know if there are locations', function () {
    JobCtrl.locations = ["North Korea", "The Moon"];
    expect(JobCtrl.areThereLocations()).toEqual(true);
  });

  it('should know if there are no locations', function () {
    JobCtrl.locations = [];
    expect(JobCtrl.areThereLocations()).toEqual(false);
  });

  //Test createLocations (WIP)
  // it('should create a location', function () {
  //   JobCtrl.locations = ["North Korea", "The Moon"];
  //   expect(JobCtrl.createLocations(JobCtrl.locations, return)).toEqual([{name: "North Korea"}, {name: "The Moon"}]);
  // });
});
