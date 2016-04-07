'use strict';

angular.module('ulyssesApp')
  .controller('BuilderCtrl', function ($scope, $state, $stateParams, Job, Slot, Auth, Volunteer) {
    var self = this;
    self.error = false;
    self.success = false;
    self.errorMessage = "";

    var areThereJobs = false;
    var areThereSlots = false;
    Job.query({}, function(results) {
      if(results.length > 0) {
        areThereJobs = true;
      } else {
        areThereJobs = false;
      }
    })

    Slot.query({}, function(results) {
      if(results.length > 0) {
        areThereSlots = true;
      } else {
        areThereSlots = false;
      }
    })

    self.isSuccess = function () {
      return self.success;
    }

    self.isError = function () {
      return self.error;
    }

    self.buildSchedule = function() {
      // check for no time slots, no jobs, etc
      console.log(areThereJobs);
      console.log("slot", areThereSlots);

      if(!areThereJobs) {
        self.success = false;
        self.error = true;
        self.errorMessage = "You must create jobs before building a schedule.";
      } else if(!areThereSlots) {
        self.success = false;
        self.error = true;
        self.errorMessage = "You have yet to create time slots for your entered jobs.";
      } else {
        console.log("Start creating schedule...");
      }
    }
  });
