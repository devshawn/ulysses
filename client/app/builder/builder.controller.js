'use strict';

angular.module('ulyssesApp')
  .controller('BuilderCtrl', function ($scope, $state, $stateParams, Job, Slot, Auth, Volunteer, Team) {
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

        var checkChild = function(volunteer) {
          return volunteer.childTeam.length > 12;
        }

        // function from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
        var romanize = function(num) {
            if (!+num)
                return false;
            var digits = String(+num).split(""),
                key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
                       "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
                       "","I","II","III","IV","V","VI","VII","VIII","IX"],
                roman = "",
                i = 3;
            while (i--)
                roman = (key[+digits.pop() + (i * 10)] || "") + roman;
            return Array(+digits.join("") + 1).join("M") + roman;
        }

        var numberPlace = function(number, increment){
            return number%increment;
        }

        var subtract15Minutes = function(time) {
          var newTime = numberPlace(time, 100);
          if(newTime >= 15) {
            time = time - 15;
          } else {
            if(time >= 100 && time < 200) {
              time = time + 1200;
            }
            time = time - 55;
          }
          return time;
        }

        var add45Minutes = function(time) {
          var newTime = numberPlace(time, 100);
          if(newTime < 15) {
            time = time + 45;
          } else {
            if(time >= 1215) {
              time = time + 85;
              time = time % 1200;
            } else {
              time = time + 85;
            }
          }
          return time;
        }

        // first, find all team conflicts for volunteersNeeded
        var volunteers;
        Volunteer.query({}, function(results) {
          volunteers = results;
          volunteers = volunteers.filter(checkChild);
          console.log(volunteers);

          // next, loop through volunteers and check for team conflicts
          Team.query({}, function(teams) {
            volunteers.forEach(function(vol, i, theVolArray) {
              vol.commitments = [];
              // create array of child team / division stuff to look through
              var array = vol.childTeam.split(',');
              array.forEach(function(item, index, theArray) {
                item = item.trim();
                item = item.replace(/^#/, '');
                var memberNumber = item.split(' ')[0];
                var problemNumber = item.split(' ')[1].split('/')[0];
                var divisionNumber = romanize(item.split(' ')[1].split('/')[1]);
                theArray[index] = {'member' : memberNumber, 'problem' : problemNumber, 'division' : divisionNumber};
              });

              // loop through each value in the array and check for a team conflict
              array.forEach(function(item) {
                teams.forEach(function(team) {
                  if(team.problem == item.problem && team.division == item.division && team.teamNumber == item.member) {
                    var startTime = subtract15Minutes(parseInt(team.longTime.replace(/[^0-9]/, '')));
                    var endTime = add45Minutes(parseInt(team.longTime.replace(/[^0-9]/, '')));
                    //console.log("Old: ", team.longTime, "new: ", longTime);
                    vol.commitments.push({'start' : startTime, 'end' : endTime});
                  }
                });
              });

              console.log(array);
              theVolArray[i] = vol;
            });
            console.log(volunteers);
          });
        });

        // do slots
        Slot.query({}, function(results) {
          //
        });
      }
    }

    //jobsArray should be the list of jobs pulled from the DB as of this comment.
    var jobsToShifts = function(jobsArray) {
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

    //person structure {'commitments':[]}
    //commitment {'slotID' : string, 'start':n1,'end':n2}
    //preference {'thing':j,'magnitude':m}

    // input:
    // slots: {id : string, start: number, end: number, volunteersNeeded: number}
    // volunteers: {id : string, 'commitments' : []}

    // output:
    // [{'volunteerID' : String, 'slotID' : String}]

    var makeSchedules = function(jobs,volunteers,n){
      var i=0;
      var best={'schedule':[],'unassigned':[],'score':999999999999999};
      while(i++<n){
        var temp = self.generateSchedule(jobs,volunteers);
        if(temp.score<best.score){
          best=temp;
        }
      }
      return best;
    }

    var generateSchedule = function(jobs,volunteers){
      var j = jobs;
      var v = volunteers;
      var unassigned = j.reduce(function(a,b){
        if(!(self.addJobToVolunteer(b,v))){
          a.push(b);
        }
        return a;
      });
      return {'schedule':v,'unassigned':unassigned,'score':(self.rateSchedule(v)+unassigned.length*5)};
    }

    var addJobToVolunteer = function(job,volunteers){
      var i = 0;
      while(i++<volunteers.length){
        var v = volunteers.shift();
        if(self.canInsert(job.start,job.end,v.commitments)){
          v.commitments.push(job);
          volunteers.push(v);
          return true;
        }else{
          volunteers.push(v);
        }
      }
      return false;
    }

    //array->array
    var shuffleArray = function(arr) {
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

    var canInsert = function(start,end,commitments){
      return commitments.reduce(function(x,y){return x&&(((start>y.start)&&(end>y.end))||((start<y.start)&&(end<y.end)));});
    }

    var rateSchedule = function(schedule) {
      var score = 0;
      for(var i = 0; i < schedule.length; i++){
        score = score + self.personMetric(schedule[i]);
      }
      return score;
    }


    var personMetric = function(person){
      return person.commitments.length * person.commitments.length;
    }


    var print = function(arg){
      console.log(arg);
    }
  });
