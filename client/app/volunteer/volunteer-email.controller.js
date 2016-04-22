'use strict';

angular.module('ulyssesApp')
  .controller('VolunteerEmailCtrl', function($http, $interpolate, $scope, $uibModalInstance, body, subject, to) {
    $scope.body = body;
    $scope.subject = subject;
    $scope.to = to;

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.send = function() {
      var output = $interpolate($scope.body);

      var emails = to.map(function(person) {
        return {
          to: person.email,
          subject: $scope.subject,
          body: output({
            assignments: 'lol we\'ll get to assignments later',
            volunteer: person
          })
        }
      });

      $http.post('/mail', emails).then($uibModalInstance.close);
    };
  });
