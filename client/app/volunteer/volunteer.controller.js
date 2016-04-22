'use strict';

angular.module('ulyssesApp')
  .controller('VolunteerCtrl', function ($scope, $state, $stateParams, Volunteer, $location, Location, $anchorScroll, $uibModal, Job, Slot) {
    var self = this;

    self.data = [];
    self.volunteer = {};
    self.readOnly = true;
    self.success = false;
    self.error = false;
    self.errorMessage = "";
    self.slots = [];
    self.jobTitles = [];

    self.isSuccess = function () {
      return self.success;
    }

    self.isError = function () {
      return self.error;
    }

    self.email = function(volunteers) {
      $uibModal.open({
        controller: 'VolunteerEmailCtrl',
        templateUrl: 'app/volunteer/volunteer-email.html',
        resolve: {
          body: function() {
            return `Dear {{ first_name }},

Thank you very much for volunteering as an Odyssey of the Mind judge. On tournament day, please report to the tournament location no later than 8:00 am for introductions and meetings with your judging teams. Your judging assignment will be:
{{ assignments }}

If there are any changes you need to make to this scheduele, please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`;
          },
          subject: function() {
            return 'Your Odyssey volunteer assignment'
          },
          to: function() {
            return volunteers;
          }
        }
      });
    };

/*
//judging template; currently in use
`Dear {{ first_name }},

Thank you very much for volunteering as an Odyssey of the Mind judge. On tournament day, please report to the tournament location no later than 8:00 am for introductions and meetings with your judging teams. Your judging assignment will be:
{{ assignments }}

If there are any changes you need to make to this scheduele, please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`

//non-judging job template
`Dear {{ first_name }},

Thank you very much for volunteering for Odyssey of the Mind. On tournament day, please report to the tournament location before you're first shift. Your job assignment(s) will be:
{{ job }}: {{ assignments }}

If there are any issues with these job shifts please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`

//not needed template
`Dear {{ first_name }},

Thank you very much for volunteering for Odyssey of the Mind. We have had an influx of volunteers this year and you are not needed as a volunteer. Again, we would like to thank you for volunteering would hope that you volunteer again next year.

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`

//changes have been made that affect a volunteer
`Dear {{ first_name }},

There have been changes made to the volunteer schedule for Odyssey of the Mind. These changes have affected you and your new schedule is:

{{ job }}: {{ assignments }}

On tournament day, please report to the tournament location before you're first shift. If there are any issues with these new job shifts please contact {{ contact_info }}

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`

//changes are being made template
`Dear {{ first_name }},

We have received your email where you informed us of the conflict in the current schedule. Once we have fixed these issues we will send another email with your new schedule.

Sincerely,

{{ organizer_name }}
Odyssey of the Mind Organizer`
*/


    console.log($state.current.name);
    if ($state.current.name == "volunteer") {
      Volunteer.query({}, function(results) {
        results.forEach(function( volunteer) {
          if(volunteer.slots.length > 0) {
            volunteer.hasSchedule = true;
          } else {
            volunteer.hasSchedule = false;
          }
        });
        self.data = results;
      });

      self.areThereVolunteers = function() {
        if(self.data) {
          return !(self.data.length == 0);
        }
      }

      self.removeVolunteer = function (volunteer) {
        if(confirm("Are you sure you want to delete this volunteer?")) {
          console.log("Deleting");

          volunteer.slots.forEach(function(slot) {
            console.log(slot);
            Slot.get({id: slot}, function (response) {
              console.log("Removing from slot");
              var slot2 = response;
              var index = slot2.volunteers.indexOf(volunteer._id);
              slot2.volunteers.splice(index, 1);
              Slot.update({id: slot}, slot2);
            });
          });

          Volunteer.remove({id: volunteer._id});
          var index = self.data.indexOf(volunteer);
          if(index > - 1) {
            self.data.splice(index, 1);
          }
        }
      }


    } else if ($state.current.name == "volunteer-details" || $state.current.name == "volunteer-schedule") {

      Job.query().$promise.then(function(results) {
        results.forEach(function(job) {
          console.log("run");
          self.jobTitles.push({title: job.title, id: job._id});
        });
        console.log(
          self.jobTitles);
      }, function(error) {
        console.log("ERROR");
      });

      self.parseTime = function(time) {
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
      }

      self.getJobTitle = function(name) {
        var title;
        self.jobTitles.forEach(function(job) {

          if(job.id == name) {
            title = job.title;
          }

        });
        return title;
      }

      self.exists = false;

      self.volunteer = Volunteer.get({id: $stateParams.id}, function (response) {
        self.exists = true;
        self.volunteer.slots.forEach(function(data) {
          console.log("id: ", data);
          Slot.get({id: data}).$promise.then(function(results) {
            self.volunteer.locations.forEach(function(location) {
              if(location.slotID == data) {
                Location.get({id: location.locationID}, function(location2) {
                  results.location = location2.name;
                  console.log("async finished");
                  self.slots.push(results);
                  console.log(self.slots);
                })
              }
            })
          }, function(error) {
            console.log("ERROR");
          });
        });
      });

      self.doesVolunteerExist = function() {
        if(self.volunteer) {
          return self.exists;
        }
      }

      self.areThereSlots = function() {
        if(self.slots) {
          return !(self.slots.length == 0);
        }
      }

      self.isReadOnly = function() {
        return self.readOnly;
      }

      self.cancelUpdates = function() {
        console.log("Cancel");
        $anchorScroll();
        self.volunteer = Volunteer.get({id: $stateParams.id}, function (response) {
          self.volunteer.slots.forEach(function(data) {
            console.log("id: ", data);
            Slot.get({id: data}).$promise.then(function(results) {
              console.log("async finished");
              self.slots.push(results);
              console.log(self.slots);
            }, function(error) {
              console.log("ERROR");
            });
          });
        });

        self.toggleEdit();
        self.success = false;
        self.error = false;

      }

      self.toggleEdit = function () {
        self.readOnly = !self.readOnly;
      }

      self.updateVolunteer = function() {

        if (self.volunteer.firstName.length >= 1 && self.volunteer.lastName.length >= 1) {
          console.log("Clicked update!");
          var data = { firstName: self.volunteer.firstName, lastName: self.volunteer.lastName, assoc: self.volunteer.assoc, street1: self.volunteer.street1, street2: self.volunteer.street2,
            city: self.volunteer.city, state: self.volunteer.state, zip: self.volunteer.zip, country: self.volunteer.country, region: self.volunteer.region, phone: self.volunteer.phone, workPhone: self.volunteer.workPhone,
            email: self.volunteer.email, fax: self.volunteer.fax, assocExp: self.volunteer.assocExp, coachExp: self.volunteer.coachExp, memberExp: self.volunteer.memberExp, username: self.volunteer.username,
            password: self.volunteer.password, current: self.volunteer.current, jobPreference1: self.volunteer.jobPreference1, jobPreference2: self.volunteer.jobPreference2, membershipNumber: self.volunteer.membershipNumber,
            problem: self.volunteer.problem, division: self.volunteer.division, submitDate: self.volunteer.submitDate, lastModified: self.volunteer.lastModified, mName: self.volunteer.mName, mRegion: self.volunteer.mRegion,
            childTeam: self.volunteer.childTeam, coachName: self.volunteer.coachName, coachEmail: self.volunteer.coachEmail, tshirtSize: self.volunteer.tshirtSize, positionHeld: self.volunteer.positionHeld, comment: self.volunteer.comment, organizerComment: self.volunteer.organizerComment, isJudge: self.volunteer.isJudge};
          Volunteer.update({id: self.volunteer._id}, data);

          self.readOnly = true;
          self.success = true;
          self.error = false;
          $anchorScroll();

        }
        else {
          console.log("error");
          self.success = false;
          self.error = true;
          $anchorScroll();
        }
      }


    } else if ($state.current.name == "volunteer-create") {
      // Working on Button Submit still.


      self.firstName = "";
      self.lastName = "";
      self.assoc = "";
      self.street1 = "";
      self.street2 = "";
      self.city = "";
      self.state = "";
      self.zip = "";
      self.country = "";
      self.region = "";
      self.phone = "";
      self.workPhone = "";
      self.email = "";
      self.fax = "";
      self.assocExp = "";
      self.coachExp = "";
      self.memberExp = "";
      self.username = "";
      self.password = "";
      self.current = "";
      self.jobPreference1 = "";
      self.jobPreference2 = "";
      self.membershipNumber = "";
      self.problem = "";
      self.division = "";
      self.submitDate = "";
      self.lastModified = "";
      self.mName = "";
      self.mRegion = "";
      self.childTeam = "";
      self.coachName = "";
      self.coachEmail = "";
      self.tshirtSize = "";
      self.positionHeld = "";
      self.comment = "";
      self.isJudge = false;
      self.slots = [];




      self.addVolunteer = function () {
        console.log(self.firstName)
        if (self.firstName.length >= 1 && self.lastName.length >= 1) {
          console.log(self.firstName);
          console.log("Clicked submit!");
          var data = { firstName: self.firstName, lastName: self.lastName, assoc: self.assoc, street1: self.street1, street2: self.street2,
            city: self.city, state: self.state, zip: self.zip, country: self.country, region: self.region, phone: self.phone, workPhone: self.workPhone,
            email: self.email, fax: self.fax, assocExp: self.assocExp, coachExp: self.coachExp, memberExp: self.memberExp, username: self.username,
            password: self.password, current: self.current, jobPreference1: self.jobPreference1, jobPreference2: self.jobPreference2, membershipNumber: self.membershipNumber,
            problem: self.problem, division: self.division, submitDate: self.submitDate, lastModified: self.lastModified, mName: self.mName, mRegion: self.mRegion,
            childTeam: self.childTeam, coachName: self.coachName, coachEmail: self.coachEmail, tshirtSize: self.tshirtSize, positionHeld: self.positionHeld, comment: self.comment, isJudge: self.isJudge, slots: []};
          Volunteer.save(data);

          self.firstName = "";
          self.lastName = "";
          self.assoc = "";
          self.street1 = "";
          self.street2 = "";
          self.city = "";
          self.state = "";
          self.zip = "";
          self.country = "";
          self.region = "";
          self.phone = "";
          self.workPhone = "";
          self.email = "";
          self.fax = "";
          self.assocExp = "";
          self.coachExp = "";
          self.memberExp = "";
          self.username = "";
          self.password = "";
          self.current = "";
          self.jobPreference1 = "";
          self.jobPreference2 = "";
          self.membershipNumber = "";
          self.problem = "";
          self.division = "";
          self.submitDate = "";
          self.lastModified = "";
          self.mName = "";
          self.mRegion = "";
          self.childTeam = "";
          self.coachEmail = "";
          self.coachName = "";
          self.tshirtSize = "";
          self.positionHeld = "";
          self.comment = "";
          self.isJudge = false;
        }
        else {
          console.log("error");
          alert("Required information is missing!")
        }
      }
    }
  });
