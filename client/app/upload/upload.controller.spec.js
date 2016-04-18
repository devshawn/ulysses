'use strict';

describe('Controller: UploadCtrl', function () {

  // load the controller's module
  beforeEach(module('ulyssesApp'));

  var UploadCtrl, scope, file;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UploadCtrl = $controller('UploadCtrl', {
      $scope: scope
    });
  }));

  // // Test Upload File (WIP)
  //
  // it('should upload a file', function () {
  //   UploadCtrl.fileinput = file;
  //   UploadCtrl.uploadFile();
  //   expect(1).toEqual(1);
  // });
  //
  // // Test Upload Teams
  //
  // it('should upload a team file', function () {
  //   expect(1).toEqual(1);
  // });
  //
  // // Test Is Uploaded
  //
  // it('should know if a file is uploaded', function () {
  //   var file = {
  //     name: "test.csv",
  //
  //   }
  //   UploadCtrl.fileinput = file;
  //   UploadCtrl.uploadFile();
  //   expect(UploadCtrl.isUploaded()).toEqual(true);
  // });
  //
  // // Test Is Uploaded 2
  //
  // it('should know if a team file is uploaded', function () {
  //   expect(1).toEqual(1);
  // });

});
