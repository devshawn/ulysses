'use strict';

angular.module('ulyssesApp')
  .controller('BuilderCtrl', function ($scope, $state, $window, $stateParams, Job, Slot, Auth, Volunteer, Team) {
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

            volunteers.sort(function(a, b) {
              return b.commitments.length - a.commitments.length;
            });

            Slot.query({}, function(slots) {
              // call generate schedule here
              console.log("Volunteers: ", volunteers);
              console.log("Slots: ", slots);

              // final datastructure of volunteers assigned to time slots
              var final = [];

              // duplicate slots based on volunteers left to be added
              var totalSlots = [];
              slots.forEach(function(slot) {
                for(var i = 0; i < (slot.volunteersNeeded - slot.volunteers.length); i++) {
                  totalSlots.push(slot);
                }
              });
              console.log("Duped slots: ", totalSlots);

              volunteers.forEach(function(volunteer) {
                if(totalSlots.length > 0) {
                  if(volunteer.commitments.length > 0) {
                    // if we have commitments
                    if(volunteer._id != "") {
                      //console.log(totalSlots[0]);
                      //console.log(volunteer.commitments)
                      var slotToAdd = self.findSlot(totalSlots, volunteer.commitments);
                      //console.log("SLOT TO ADD", slotToAdd);
                      if(slotToAdd) {
                        slotToAdd.locations.forEach(function(loc) {
                          if(loc.value > 0) {
                            //
                          }
                        })
                        final.push({'volunteerID' : volunteer._id, 'slotID' : slotToAdd._id,  'locationID' : slotToAdd.locations[0]});
                        var index = -1;
                        totalSlots.forEach(function(slot, i) {
                          if(slot._id == slotToAdd._id) {
                            index = i;
                          }
                        });
                        if(index > -1) {
                          totalSlots.splice(index, 1);
                        }
                      } else {
                        console.log("skipped over", volunteer._id);
                      }
                    }

                  } else {
                    // no commitments
                    final.push({'volunteerID' : volunteer._id, 'slotID' : totalSlots[0]._id, 'locationID' : totalSlots[0].locations[0]});
                    totalSlots.splice(0, 1);
                  }
                }
              });
              console.log("Final schedule: ", final);

              // now, add volunteers to slots.
              final.sort(function(a, b) {
                return b.slotID > a.slotID;
              });
              // now, add volunteers to slots.
              slots.sort(function(a, b) {
                return b._id > a._id;
              });

              var organizedSlots = [];

              slots.forEach(function(slot) {
                organizedSlots.push(final.slice(0, (slot.volunteersNeeded - slot.volunteers.length)));
                final.splice(0, (slot.volunteersNeeded - slot.volunteers.length));
              });

              console.log("Organized: ", organizedSlots);

              // loop through organized slots
              organizedSlots.forEach(function(slot) {
                var volunteers = [];
                if(slot.length > 0) {
                  slot.forEach(function(minislot) {
                    console.log(minislot);
                    volunteers.push(minislot.volunteerID);
                    var locations = [];
                    locations.push({'slotID' : minislot.slotID, 'locationID' : minislot.locationID});
                    console.log("Locations: ", locations);
                    Volunteer.update({id: minislot.volunteerID}, {'slots' : [minislot.slotID], 'locations' : locations});
                  });
                  Slot.update({id: slot[0].slotID}, {'volunteers' : volunteers});
                }
              });
              //$window.location.href = '/schedule';
              self.success = true;
              self.error = false;

            });
          });
        });
      }
    }

    self.findSlot = function(totalSlots, commitments) {
      var toReturn = [];
      totalSlots.forEach(function(slot) {
        var foundConflict = false;
        commitments.forEach(function(commitment) {
          if(self.isConflict(slot, commitment)) {
            //console.log("FOUND CONFLICT");
            foundConflict = true;
          }
        });
        if(!foundConflict && toReturn.length == 0) {
          toReturn.push(slot);
        }
      });

      if(toReturn.length > 0) {
        return toReturn[0];
      } else {
        return false;
      }
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
        return true;
      } else {
        return false;
      }
    }

    self.conflictLoop = function(slot1, volunteerid, callback) {
      console.log("test");
      Volunteer.get({id: volunteerid }, function(results) {
        var hasCalledBack = false;
        for(var i = 0; i < results.slots.length; i++)
        {
          Slot.get({id: results.slots[i]}, function(results1) {
            console.log(results1);
            if(self.isConflict(slot1, results1))
            {
              callback(true);
              hasCalledBack = true;
            } else if(i == results.slots.length) {
              if(!hasCalledBack) {
                callback(false);
              }
            }
          });
        }

        if(results.slots.length == 0) {
          callback(false);
        }
      });
    }
  });
