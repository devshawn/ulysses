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
      //console.log(areThereJobs);
      //console.log("slot", areThereSlots);

      if(!areThereJobs) {
        self.success = false;
        self.error = true;
        self.errorMessage = "You must create jobs before building a schedule.";
      } else if(!areThereSlots) {
        self.success = false;
        self.error = true;
        self.errorMessage = "You have yet to create time slots for your entered jobs.";
      } else {
        //console.log("Start creating schedule...");

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

              //console.log(array);
              theVolArray[i] = vol;
            });
            Slot.query({}, function(slots) {
              // call generate schedule here
              //console.log("Volunteers: ", volunteers);
              //console.log("Slots: ", results);

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

    //array,array->array
    self.prettyMakeSchedule=function(slots,volunteers){
      return self.prettifyOutput(self.makeSchedules(self.slotsToJobs(slots),self.addNewCommitments(volunteers),1000));
    }

    //array slots->array slots
    self.slotsToJobs = function(arrayOfSlots) {
      //console.log(arrayOfSlots);
      var b = [];
      for(var i=0;i<arrayOfSlots.length;i++){
        //console.log(arrayOfSlots[i]);
        //console.log(arrayOfSlots[i].volunteersNeeded);
        var j = 0;
        for(var j=0;j<arrayOfSlots[i].volunteersNeeded;j++){
          b.push({'slotID': arrayOfSlots[i].jobID, 'start': arrayOfSlots[i].start, 'end': arrayOfSlots[i].end});
         // console.log("yay success");
        }
      }
      return b;
    }

    //array of {array array int}->array
    self.prettifyOutput = function(schedules){
      //console.log(schedules);
      var s = schedules.schedule;
      var b = [];
      for(var i=0;i<s.length;i++){
        for(var j=0;j<s[i].newCommitments.length;j++){
            //console.log({'volunteerID':s[i]._id,'slotID':s[i].newCommitments[j].slotID});
            b.push({'volunteerID':s[i]._id,'slotID':s[i].newCommitments[j].slotID});
      }
        //console.log("and here");
        //console.log(b);
    }
    return b;
    }

    //array,array,int->{array array int}
    self.makeSchedules = function(jobs,volunteers,n){
      //console.log("generating MANY schedules");
      var i=0;
      var best={'schedule':[],'unassigned':[],'score':9999999999999999999};
      for(var i=0;i<n;i++){
        var temp = self.generateSchedule(jobs,volunteers);
        if(temp.score<best.score){
          best=temp;
          //console.log("you suck at programming");
          //console.log(best);
        }
      }

      return best;
    }

    //array,array->{array array int}
    self.generateSchedule = function(jobs,volunteers){
      //console.log("generating a schedule");
      var j = self.shuffleArray(jobs);
      //console.log("volunteers is: " + volunteers)
      var v = self.shuffleArray(volunteers);
     // console.log("finished shuffling");
      var unassigned = [];
      var i=0;
      for(var i=0;i<j.length;i++){
       // console.log("fuck reduce");
        if(!(self.addJobToVolunteer(j[i],v))){unassigned.push(j[i]);}
      }
      return {'schedule':v,'unassigned':unassigned,'score':(self.rateSchedule(v)+unassigned.length*5)};
    }

    //json object,array->boolean (has a side effect on volunteers)
    self.addJobToVolunteer = function(job,volunteers){
      for(var i=0;i<volunteers.length;i++){
        var v = volunteers.shift();
        if(self.canInsert(job.start,job.end,v.commitments.concat(v.newCommitments))){
          v.newCommitments.push(job);
          volunteers.push(v);
          return true;
        }else{
          volunteers.push(v);
          return false;
        }
      }
    }

    //array->array
    self.addNewCommitments = function(schedule){
      var mySchedule = schedule;
      for(var i = 0;i<mySchedule.length;i++){
        mySchedule[i].newCommitments = [];
      }
      return mySchedule;
    }

    //array->array
    self.shuffleArray = function(arr) {
     // console.log("shuffling, every day");
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

    //int,int,array->boolean
    self.canInsert = function(start,end,commitments){
     // console.log("canInserting?");
      var i = 0;
      var b = true;
      for(var i=0;i<commitments.length;i++){
        var y=commitments[i];
        b=b&&(((start>y.start)&&(end>y.end))||((start<y.start)&&(end<y.end)));
        }
      return b;
    }

    //array->int
    self.rateSchedule = function(schedule) {
     // console.log("ratingSchedule");
      var score = 0;
      for(var i = 0; i < schedule.length; i++){
        score = score + self.personMetric(schedule[i]);
      }
    //  console.log("rated at: "+score);
      return score;
    }


    //json object->int
    self.personMetric = function(person){
      return person.commitments.concat(person.newCommitments).length * person.commitments.concat(person.newCommitments).length;
    }

  });
