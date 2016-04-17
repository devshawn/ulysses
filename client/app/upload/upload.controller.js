'use strict';

angular.module('ulyssesApp')
  .controller('UploadCtrl', function($http, $scope, socket, Upload, Job, Volunteer, Location, Auth) {
    var self = this;
    var uploaded = false;
    var uploaded2 = false;

    self.uploadFile = function() {
      console.log("Clicked submit");
      Papa.parse(this.fileinput, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {

          console.log(results);
          Upload.save({"type" : 1, "results" : results}, function (response) {
            if(response['success']) {
              uploaded = true;
              console.log("Successful upload");

              var jobsToCreate = [];

              var volunteers = Volunteer.query(function() {
                console.log("Got the things of stuff.");

                volunteers.forEach(function(vol) {
                  if (vol.jobPreference1.includes("Non-Judging")) {
                    var title = vol.jobPreference1.substring("Non-Judging".length + 1);
                    if (title != "" && title != null && title != " " && title != "No Preference" && title != "none" && title != "None" &&
                      jobsToCreate.indexOf(title) == -1) {
                      console.log(title);
                      jobsToCreate.push(title);
                    }
                  }
                  if (vol.jobPreference2.includes("Non-Judging")) {
                    var title = vol.jobPreference2.substring("Non-Judging".length + 1);
                    if (title != "" && title != null && title != " " && title != "No Preference" && title != "none" && title != "None" &&
                      jobsToCreate.indexOf(title) == -1) {
                      console.log(title);
                      jobsToCreate.push(title);
                    }
                  }
                });

                jobsToCreate.forEach(function(title) {
                  var data = {title: title, description: "This job lacks description!", createdBy: Auth.getCurrentUser()._id};
                  Job.save(data, function(success) {
                    Location.save({'name' : 'Default Location', 'jobID' : success._id}, function(done) {
                      success.locations.push(done._id);
                      Job.update({id: done.jobID}, {'locations' : success.locations});
                    });
                  });
                });

              });

            }
          });
        }
      });
    }

    self.uploadTeams = function() {
      console.log("Clicked submit 2");
      Papa.parse(this.fileinput2, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {

          console.log(results);
          Upload.save({"type" : 2, "results" : results}, function (response) {
            if(response['success']) {
              uploaded2 = true;
              console.log("Successful upload");
            }
          });
        }
      });
    }

    self.isUploaded = function() {
      return uploaded;
    }

    self.isUploaded2 = function() {
      return uploaded2;
    }
  });
