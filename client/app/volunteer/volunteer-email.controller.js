'use strict';

angular.module('ulyssesApp')
  .controller('VolunteerEmailCtrl', function($scope, $uibModalInstance, body, to) {
    $scope.body = body;
    $scope.to = to;

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
