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
        assignments: assignmentList(volunteer.locations),
        first_name: volunteer.firstName,
        last_name: volunteer.lastName,
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
      judge: `Dear {{ first_name }},

Thank you very much for volunteering as an Odyssey of the Mind judge. On tournament day, please report to the tournament location no later than 8:00 am for introductions and meetings with your judging teams. Your judging assignment will be:

{{ assignments }}

If there are any changes you need to make to this schedule, please contact me.

Sincerely,

Your Odyssey of the Mind Organizer`,
      nonJudge: `Dear {{ first_name }},

Thank you for your participation in this event! Your volunteer assigments are as follows:

{{ assignments }}

If there are any issues with these job shifts, please contact me.

Sincerely,

Your Odyssey of the Mind Organizer`,
      notNeeded: `Dear {{ first_name }},

Thank you for your participation in this event! Due to a variety of constraints, we were unable to assign you to any volunteer positions, but we hope you still enjoy coming to watch the performance.

Sincerely,

Your Odyssey of the Mind Organizer`,
      changes: `Dear {{ first_name }},

There have been changes made to the volunteer schedule for Odyssey of the Mind. Your new schedule is:

{{ assignments }}

On tournament day, please report to the tournament location before your first shift. If there are any issues with these new job shifts please contact me.

Sincerely,

Your Odyssey of the Mind Organizer`
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.send = function() {
      var emails = to.map(function(person) {
        return {
          to: person.email,
          subject: $scope.subject,
          body: $scope.generate(person)
        }
      });

      $http.post('/mail', emails).then($uibModalInstance.close);
    };

    $scope.swap = function(key) {
      $scope.body = templates[key];
    };

    var parseTime = function(time) {
      if(time) {
        var strTime = "";
        if(time >= 1300) {
          time = time - 1200;
          strTime = time.toString();
          strTime = strTime.substring(0, strTime.length / 2) + ":" + strTime.substring(strTime.length / 2, strTime.length);
          strTime = strTime + " PM";
        } else if(time >= 1200) {
          strTime = time.toString();
          strTime = strTime.substring(0, strTime.length / 2) + ":" + strTime.substring(strTime.length / 2, strTime.length);
          strTime = strTime + " PM";
        } else {
          strTime = time.toString();
          strTime = strTime.substring(0, strTime.length / 2) + ":" + strTime.substring(strTime.length / 2, strTime.length);
          strTime = strTime + " AM";
        }

        return strTime;
      }
    };

    var assignmentList = function(assignments) {
      var lines = [];

      assignments.forEach(function(assignment) {
        lines.push(parseTime(assignment.slot.start) + '-' + parseTime(assignment.slot.end) + ': ' +
          assignment.job.title + ' ' +
          '(' + assignment.location.name + ')');
      });

      return lines.join('\n');
    };
  });
