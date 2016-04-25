'use strict';

angular.module('ulyssesApp')
  .controller('VolunteerEmailCtrl', function($http, $interpolate, $scope, $uibModalInstance, to) {
    $scope.body = '';
    $scope.subject = 'Your Odyssey of the Mind assignment';
    $scope.to = to;

    $scope.preview = '';

    var templates = {
      judge: `Dear {{ volunteer.firstName }},

Thank you very much for volunteering as an Odyssey of the Mind judge. On tournament day, please report to the tournament location no later than 8:00 am for introductions and meetings with your judging teams. Your judging assignment will be:

{{ volunteer.slots | assignments }}

If there are any changes you need to make to this scheduele, please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`,
      nonJudge: `Dear {{ volunteer.firstName }},

Thank you very much for volunteering for Odyssey of the Mind. On tournament day, please report to the tournament location before you're first shift. Your job assignment(s) will be:

{{ volunteer.slots | assignments }}

If there are any issues with these job shifts please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`,
      notNeeded: `Dear {{ volunteer.firstName }},

Thank you very much for volunteering for Odyssey of the Mind. We have had an influx of volunteers this year and you are not needed as a volunteer. Again, we would like to thank you for volunteering would hope that you volunteer again next year.

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`,
      changes: `Dear {{ volunteer.firstName }},

There have been changes made to the volunteer schedule for Odyssey of the Mind. These changes have affected you and your new schedule is:

{{ volunteer.slots | assignments }}

On tournament day, please report to the tournament location before you're first shift. If there are any issues with these new job shifts please contact {{ contact_info }}

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
  .filter('assignments', function() {
    return function(input) {
      return input.join(', ');
    };
  });
