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
          return volunteer.childTeam.length > 0;
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
            Slot.query({}, function(slots) {
              // call generate schedule here
              console.log("Volunteers: ", volunteers);
              console.log("Slots: ", results);

              console.log(self.prettyMakeSchedule(slots, volunteers))
            });
          });
        });

        // do slots
        Slot.query({}, function(results) {

        });
      }
    }

    //person structure {'commitments':[]}
    //commitment {'slotID' : string, 'start':n1,'end':n2}
    //preference {'thing':j,'magnitude':m}

    // input:
    // slots: {id : string, start: number, end: number, volunteersNeeded: number}
    // volunteers: {id : string, 'commitments' : []}

    // output:
    // [{'volunteerID' : String, 'slotID' : String}]


    self.prettyMakeSchedule=function(slots,volunteers){
      return self.prettifyOutput(self.makeSchedules(self.slotsToJobs(slots),volunteers,1000));
    }


    self.slotsToJobs = function(arrayOfSlots) {
      console.log(arrayOfSlots);
      var b = [];
      var i = 0;
      while (i++ < arrayOfSlots.length-1) {
        console.log(arrayOfSlots[i]);
        console.log(arrayOfSlots[i].volunteersNeeded);
        var j = 0;
        while (j++ < arrayOfSlots[i].volunteersNeeded-1) {
          b.push({'slotID': arrayOfSlots[i].jobID, 'start': arrayOfSlots[i].start, 'end': arrayOfSlots[i].end});
          console.log("yay success");
        }
      }
      return b;
    }

    self.prettifyOutput = function(schedules){
      console.log(schedules);
      var s = schedules.schedule;
      var b = [];
      var i = 0;
      var j = 0;
      while(i++<s.length-1){
          while(j++<s[i].commitments.length-1) {
            console.log({'volunteerID':s[i].volunteerID,'slotID':s[i].commitments[j].slotID});
            b.push({'volunteerID':s[i].volunteerID,'slotID':s[i].commitments[j].slotID});
      }
       // console.log("and here");
      //console.log(b);
    }
    return b;
    }

    self.makeSchedules = function(jobs,volunteers,n){
      console.log("generating MANY schedules");
      var i=0;
      var best={'schedule':[],'unassigned':[],'score':999999999999999};
      while(i++<n){
        var temp = self.generateSchedule(jobs,volunteers);
        if(temp.score<best.score){
          best=temp;
          console.log("you suck at programming");
        //  console.log(best);
        }
      }

      return best;
    }

    self.generateSchedule = function(jobs,volunteers){
    //  console.log("generating a schedule");
      var j = self.shuffleArray(jobs);
      var v = self.shuffleArray(volunteers);
    //  console.log("finished shuffling");
      var unassigned = [];
      var i=0;
      while(i++<j.length-1) {
   //     console.log("fuck reduce");
        if(!(self.addJobToVolunteer(j[i],v))){unassigned.push(j[i]);}
      }
      return {'schedule':v,'unassigned':unassigned,'score':(self.rateSchedule(v)+unassigned.length*5)};
    }

    self.addJobToVolunteer = function(job,volunteers){
      var i = 0;
      while(i++<volunteers.length-1){
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
    self.shuffleArray = function(arr) {
    //  console.log("shuffling, every day");
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

    self.canInsert = function(start,end,commitments){
   //   console.log("canInserting?");
      var i = 0;
      var b = true;
      while(i++<commitments.length-1){
        var y=commitments[i];
        b=b&&(((start>y.start)&&(end>y.end))||((start<y.start)&&(end<y.end)));
        }
      return b;
    }

    self.rateSchedule = function(schedule) {
   //   console.log("ratingSchedule");
      var score = 0;
      for(var i = 0; i < schedule.length; i++){
        score = score + self.personMetric(schedule[i]);
      }
   //   console.log("rated at: "+score);
      return score;
    }


    self.personMetric = function(person){
      return person.commitments.length * person.commitments.length;
    }


    self.print = function(arg){
      console.log(arg);
    }
  });
