'use strict';

angular.module('ulyssesApp')
  .controller('VolunteerEmailCtrl', function($http, $interpolate, $scope, $uibModalInstance, to) {
    $scope.$watchGroup(['body', 'previewing'], function(values) {
      if (values[1]) {
        $scope.interpolated = $interpolate(values[0]);
      }
    });

    $scope.generate = function(volunteer) {
      return $scope.interpolated ? $scope.interpolated({
        assignments: volunteer.locations,
        volunteer: volunteer
      }) : '';
    };

    $scope.subject = 'Your Odyssey of the Mind assignment';
    $scope.to = to;

    $scope.body = '';
    $scope.interpolated = null;

    $scope.previewing = false;
    $scope.index = 0;

    var templates = {
      judge: `Dear {{ volunteer.firstName }},

Thank you very much for volunteering as an Odyssey of the Mind judge. On tournament day, please report to the tournament location no later than 8:00 am for introductions and meetings with your judging teams. Your judging assignment will be:

{{ assignments | assignmentList }}

If there are any changes you need to make to this scheduele, please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`,
      nonJudge: `Dear {{ volunteer.firstName }},

Thank you very much for volunteering forshow

If there are any issues with these job shifts please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`,
      notNeeded: `Dear {{ volunteer.firstName }},

Thank you very much for volunteering for Odyssey of the Mind. We have had an influx of volunteers this year and you are not needed as a volunteer. Again, we would like to thank you for volunteering and would hope that you volunteer again next year.

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`,
      changes: `Dear {{ volunteer.firstName }},

There have been changes made to the volunteer schedule for Odyssey of the Mind. These changes have affected you and your new schedule is:

{{ assignments | assignmentList }}

On tournament day, please report to the tournament location before your first shift. If there are any issues with these new job shifts please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.send = function() {
      var output = $interpolate($scope.body);

      $scope.preview = output({
        volunteer: to[0]
      });

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

      //$http.post('/mail', emails).then($uibModalInstance.close);
    };

    $scope.swap = function(key) {
      $scope.body = templates[key];
    };
  })
  .filter('assignmentList', function() {
    return function(assignments) {
      var list = '';

      assignments.forEach(function(assignment) {
        list += assignment.slot.start + '-' + assignment.slot.end + ': ' +
          assignment.job.title + ' ' +
          '(' + assignment.location.name + ')\n'
      });

      return list;
    };
  });
