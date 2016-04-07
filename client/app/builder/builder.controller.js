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

        // call generate schedule here

      }
    }


    //jobsArray should be the list of jobs pulled from the DB as of this comment.
    jobsToShifts(jobsArray) {
      var shiftsArray = [];
      for (var j = 0; j < jobsArray.length; j++) { // j because we are iterating though jobs
        for (var s = 0; s < jobsArray[j].shifts.length; s++) {
          shiftsArray.push({_id: jobsArray[j]._id,
            start: jobsArray[j].shifts[s].shiftStart,
            end: jobsArray[j].shifts[s].shiftEnd})
        }
        console.log(j);
      }
      return shiftsArray;
    }

    //deal with job length stuff by randomly breaking up jobs a lot...
    makeJobs() {
      for (var i = 0; i < 425; i++) {
        var a = parseInt(Math.random() * 1199)
        self.jobs.push({'_id': i, 'start': a, 'end': a + parseInt(Math.random() * 1199)})
      }
      //person structure {'_id': i,'commitments':[],'preferences':[]}}
      //commitment {'name': i, 'start':n1,'end':n2}
      //preference {'thing':j,'magnitude':m}
    }

    makeVolunteers() {
      var fakeV = []; // Array of fake volunteers
      for (var i = 0; i < self.volunteers.length; i++) {
        var a = parseInt(Math.random() * 100)
        fakeV.push({_id: self.volunteers[i]._id, commitments: [], preferences: []});
      }
      //person structure {'_id': i,'commitments':[],'preferences':[]}}
      //commitment {'name': i, 'start':n1,'end':n2}
      //preference {'thing':j,'magnitude':m}

      return fakeV;
    }

    makeSchedules() {
      var rating = 0;
      for (var i = 0; i < 1000; i++) {
        self.clearVolunteerAssignments();
        self.generateSchedule();
        //(rating = self.rateSchedule() &&
        //console.log(rating));
        if (self.rateSchedule() < self.bestRating) {
          self.bestRating = self.rateSchedule();
          self.bestSchedule = self.arr;
          console.log(self.rateSchedule());
        }
        self.shuffleArray(self.jobs);
        self.shuffleArray(self.volunteers);
      }
      console.log("----------")
      console.log(self.bestRating);
      console.log(self.bestSchedule);
      console.log("Number of unassigned jobs: " + self.checkAllJobsAssigned());
      self.$http.post('/api/schedules/', {schedule: self.bestSchedule, rating: self.bestRating});
    }

    // TODO: Fix this. It shouldn't delete all the things, just most of them.
    clearVolunteerAssignments() {
      for(var i = 0; i < self.arr.length; i++) {
        self.arr[i].commitments = [];
      }
    }

    generateSchedule() {
      var w = 0;
      for (var j = 0; j < self.jobs.length; j++) {
        for (var v = 0; v <= self.arr.length; v++) {
          if (self.insertJob(j, ((v + w) % self.arr.length))) {
            w = v + 1;
            break;
          }
        }
      }
    }

    insertJob(j, v) {
      //if not conflicts, insert and return true, else return false
      for (var c = 0; c < self.arr[v].commitments.length; c++) {
        if (((self.jobs[j].start > self.arr[v].commitments[c].start) && (self.jobs[j].start < self.arr[v].commitments[c].end)) ||
          ((self.jobs[j].end   > self.arr[v].commitments[c].start) && (self.jobs[j].end   < self.arr[v].commitments[c].end))) {
          return false;
        }
      }
      self.arr[v].commitments.push(self.jobs[j]);
      return true;
    }

    checkAllJobsAssigned() {
      var sum = 0;
      for (var i = 0; i < self.arr.length; i++) {
        sum += self.arr[i].commitments.length;
      }
      return self.jobs.length - sum;
    }

    shuffleArray(arr) {
      var temp;
      var rand;
      for (var i = 0; i < arr.length; i++) {
        rand = Math.floor(Math.random() * arr.length);
        temp = arr[i];
        arr[i] = arr[rand];
        arr[rand] = temp;
      }
      return arr;
    }

    //person structure {'_id': i,'commitments':[],'preferences':[]}}
    //commitment {'name': i, 'start':n1,'end':n2}
    //preference {'thing':j,'magnitude':m}

    rateSchedule() { // schedule is an array, probably maybe.
      var schedule = self.arr;
      var score = 0;

      for(var i = 0; i < schedule.length; i++){
        score = score + self.personMetric(schedule[i]);
      }
      score = score + (5 * self.checkAllJobsAssigned());
      return score;
      //self.print(score);
    }


    personMetric(person){
      return person.commitments.length * person.commitments.length;
    }


    print(arg){
      console.log(arg);
    }
});
