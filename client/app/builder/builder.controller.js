'use strict';

angular.module('ulyssesApp')
  .controller('BuilderCtrl', function ($scope, $state, $window, $stateParams, Job, Slot, Auth, Volunteer, Team) {
    var self = this;
    self.error = false;
    self.success = false;
    self.errorMessage = "";
    self.submitted = false;

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
      if(!self.submitted) {
        self.submitted = true;

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
          Volunteer.query({'isJudge' : false}, function(results) {
            var volunteers = results;

            // next, loop through volunteers and check for team conflicts
            Team.query({}, function(teams) {
              volunteers.forEach(function(vol, i, theVolArray) {
                vol.commitments = [];
                if(vol.childTeam.length > 0) {
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

                        if(startTime < 600) {
                          startTime += 1200;
                        }

                        if(endTime < 600) {
                          endTime += 1200;
                        }

                        //console.log("Old: ", team.longTime, "new: ", longTime);
                        vol.commitments.push({'start' : startTime, 'end' : endTime});
                      }
                    });
                  });

                  //console.log(array);
                  theVolArray[i] = vol;
                }
              });

              // now add slots to commitments
              Slot.query({}, function(slots) {
                volunteers.forEach(function(volunteer) {
                  volunteer.slots.forEach(function(slot) {
                    slots.forEach(function(slot2) {
                      if(slot == slot2._id) {
                        volunteer.commitments.push({'start' : slot2.start, 'end' : slot2.end });
                      }
                    });
                  });
                });

                console.log("Volunteers: ", volunteers);
                console.log("Slots: ", slots);

                var volunteersCopy = [];
                console.log("Copy: ", volunteersCopy)
                var duplicatedSlots = []; // slots that we need to add volunteers to
                var final = []; // our final list of volunteers tied to slot ids and locations

                // loop through each slot and create a new list of slots tied to locations
                slots.forEach(function(slot) {
                  slot.locations.forEach(function(location) {
                    console.log("count: ", location.needed)
                    for(var i = 0; i < location.needed; i++) {
                      duplicatedSlots.push({'locationID' : location.locationID, 'slotID' : slot._id, 'start' : slot.start, 'end' : slot.end});
                    }
                  });
                });

                console.log("Duplicated slots: ", duplicatedSlots);

                // find a volunteer for each slot
                duplicatedSlots.forEach(function(slot) {
                  var vol = self.findVolunteer(volunteers, slot);
                  console.log(vol);
                  if(vol) {
                    final.push({'volunteer' : vol, 'slotID' : slot.slotID, 'locationID' : slot.locationID});
                  } else {
                    console.log("NO ONE FITS");
                  }

                  var index = volunteers.indexOf(vol)
                  if(index > -1) {
                    console.log("removing vol");
                    volunteers.splice(index, 1);
                    console.log("SLOT: ", slot);
                    vol.commitments.push({'start' : slot.start, 'end' : slot.end})
                    volunteersCopy.push(vol);
                  }

                  if(volunteers.length == 0) {
                    console.log("length is 0!");
                    console.log(volunteersCopy);
                    console.log("1: ", volunteers);
                    volunteersCopy.forEach(function(vol2) {
                      volunteers.push(vol2);
                    });
                    volunteersCopy = [];
                    console.log("2", volunteers);
                    console.log("2", volunteersCopy);
                  }
                });

                console.log("Final: ", final);

                // Loop through and organize final by slots
                slots.forEach(function(slot) {
                  var data = [];
                  final.forEach(function(element) {
                    if(element.slotID == slot._id) {
                      data.push(element);
                    }
                  });

                  var vols = slot.volunteers;
                  var locs = slot.locations;
                  data.forEach(function(element) {
                    var commits = element.volunteer.locations;
                    commits.push({'locationID' : element.locationID, 'slotID' : element.slotID});
                    var slots2 = element.volunteer.slots;
                    slots2.push(element.slotID);
                    vols.push(element.volunteer._id);

                    locs.forEach(function(location) {
                      if(location.locationID == element.locationID) {
                        location.needed--;
                      }
                    })
                    Volunteer.update({id: element.volunteer._id}, {'locations' : commits, 'slots' : slots2});
                  });



                  Slot.update({id: slot._id}, {'volunteers' : vols, 'locations' : locs});
                  self.success = true;
                  self.error = false;
                  //$window.location.href = '/schedule';
                });
              });

              volunteers.sort(function(a, b) {
                return b.commitments.length - a.commitments.length;
              });
            });
          });
        }
      }
    }

    self.findVolunteer = function(volunteers, slot) {
      var toReturn = false;
      volunteers.forEach(function(volunteer) {
        var hasConflict = false;
        volunteer.commitments.forEach(function(commitment) {
          if(self.isConflict(slot, commitment)) {
            hasConflict = true;
          }
        });
        if(!hasConflict && toReturn == false) {
          toReturn = volunteer;
        } else if(hasConflict && toReturn == false) {
          //console.log(volunteer.firstName, " has a conflict");
        }

      });
      //console.log("To return: ", toReturn)
      return toReturn;
    }

      //checks to see if two time slots overlap
    self.isConflict = function(slot, commitment) {
      var start1 = parseInt(slot.start);
      var end1 = parseInt(slot.end);
      var start2 = parseInt(commitment.start);
      var end2 = parseInt(commitment.end);
      if((start1 <= start2 && start2 <= end1)) {
        return true;
      }
      else if(start2 <= start1 && start1 <= end2) {
        return true;
      }
      else if(start1 == start2 && end1 == end2)
      {
        console.log("AAA");
        return true;
      } else {
        return false;
      }
    }
  });
