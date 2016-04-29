'use strict';

angular.module('ulyssesApp').filter('unsafe', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  }
})

angular.module('ulyssesApp')
  .controller('ScheduleCtrl', function ($scope, $state, $stateParams, Job, Slot, Auth, Volunteer, Location, $sce) {
    var self = this;

    self.data = {"times" : []};
    self.times = [800,815,830,845,900,915,930,945,1000,1015,1030,1045,1100,1115,1130,1145,1200,1215,1230,1245,1300,1315,1330,1345,1400,1415,1430,1445,1500,1515,1530,1545,1600,1615,1630,1645,1700,1715,1730,1745,1800];
    //self.times = [800, 815, 830, 845, 1700];
    self.width = 10.0;
    self.slots = [];
    //self.times2 = [{"time" : 800, jobs}]


    if($state.current.name == "schedule") {
      self.slotMode = true;

      Volunteer.query({}, function(vols) {
        self.ourVolunteers = [];
        vols.forEach(function(vol) {
          self.ourVolunteers.push({'id' : vol._id, 'vol' : vol});
        });

        Location.query({}, function(locations) {
          Job.query({}, function(results) {
            self.width = ((100 / (results.length))) + "%";
            Slot.query({}, function(slots) {
              results.forEach(function(job, index, theArray) {
                slots.forEach(function(slot, i, slotsArray) {
                  var testArray = [];
                  if(slot.jobID == job._id) {
                    slotsArray[i].vols = "None";
                    slotsArray[i].left = slot.volunteersNeeded - slot.volunteers.length;
                    console.log("A: ", (slotsArray[i].left / slotsArray[i].volunteersNeeded))
                    if(slotsArray[i].left / slotsArray[i].volunteersNeeded >= 0.5) {
                      slotsArray[i].color = "color-red";
                    } else if(slotsArray[i].left / slotsArray[i].volunteersNeeded > 0) {
                      slotsArray[i].color = "color-light";//
                    }

                    slot.locations.forEach(function(location) {
                      var name = "";
                      locations.forEach(function(loc) {
                        if(loc._id == location.locationID) {
                          name = loc.name;
                        }
                      });
                      var locs = "None";
                      self.ourVolunteers.forEach(function(volunteer) {
                        volunteer.vol.locations.forEach(function(location2) {
                          if(location.locationID == location2.locationID && slot._id == location2.slotID) {
                            if(locs == "None") {
                              locs = volunteer.vol.firstName + " " + volunteer.vol.lastName;
                            } else {
                              locs += ", " + volunteer.vol.firstName + " " + volunteer.vol.lastName;
                            }
                          }
                        });
                      })
                      testArray.push({'name' : name, 'vols' : locs});
                    });

                    slot.locations = testArray;
                    console.log(testArray);

                    if(!theArray[index].slots) {
                      theArray[index].slots = [slot];
                    } else {
                      theArray[index].slots.push(slot);
                    }
                  }
                });
              });
              //console.log(results);
              self.jobs = results;
            });
          });
        });
      });


    } else {
      self.slotMode = false;
      self.jobs = Job.query({}, function(results) {
        self.width = ((100 / results.length) - (17  / results.length)) + "%";
        console.log(self.width);
      });
    }

    self.areThereJobs = function() {
      if(self.jobs) {
        return !(self.jobs.length == 0);
      }
    }

    self.getSlotMode = function() {
      return self.slotMode;
    }

    self.toggleSlotMode = function() {
      self.slotMode = !self.slotMode;
      console.log(self.slotMode);
    }

    self.getClass = function() {
      if(self.areThereJobs()) {
        return "schedule-container-big";
      } else {
        return "schedule-container";
      }
    }

    self.getSlots = function(jobID) {
    }

    self.getRow = function(time) {
      console.log("Run once");
      var result = {"slots" : []};
      Job.query({}, function(results) {
        var jobs = results;
        jobs.forEach(function(job) {
          Slot.query({jobID: job._id}, function(results2) {
            var slots = results2;
            slots.forEach(function(slot) {
              if(slot.start <= time && time < slot.end) {
                //console.log("YES");
                var vols = [];
                slot.volunteers.forEach(function(volunteer) {
                  Volunteer.get({id: volunteer}, function(results3) {
                    vols.push(results3);
                  });
                });
                result["slots"].push({"id" : slot._id, "jobID" : job._id, "volunteers" : vols});
              } else {
                //console.log("NO");
              }
            });
          });
        });
      });
      return result;
    }

    self.displaySlot = function(jobID, data) {
      if(data) {
        var returnData = [];
        data.forEach(function(element) {
          if(element["jobID"] == jobID) {
            element["volunteers"].forEach(function(volunteer) {
              console.log("test");
              var vol = volunteer.firstName + " " + volunteer.lastName;
              returnData.push(vol);
            });
          }
        });

        returnData.sort();
        var string = "";
        for(var i = 0; i < returnData.length; i++) {
          if(i == returnData.length - 1) {
            string = string + returnData[i];
          } else {
            string = string + returnData[i] + ", ";
          }
        }
        return string;
      }
    }

    self.displaySlotNew = function(jobID, data) {
      if(data) {
        var returnData = [];
        var colors = ["red", "green", "blue", "purple", ""]
        data.forEach(function(element) {
          if(element["jobID"] == jobID) {
            element["volunteers"].forEach(function(volunteer) {
              var vol = volunteer.firstName + " " + volunteer.lastName;
              var i = 0;
              var index = -1;
              self.jobs.forEach(function(job) {
                if(job._id == jobID) {
                  index = i;
                }
                i++;
              });
              var color = colors[index];
              console.log(color)
              returnData.push({"vol" : vol, "color" : color});
            });
          }
        });

        returnData.sort();
        var string = "";
        for(var i = 0; i < returnData.length; i++) {
          if(i == returnData.length - 1) {
            string = string + returnData[i].vol;
          } else {
            string = string + returnData[i].vol + ", ";
          }
        }
        if(returnData.length > 0) {
          return '<div style="color: ' + returnData[0].color + ';">' + string + '</div>';
        } else {
          return "";
        }
      }
    }

    self.parseTime = function(time) {
      console.log("Called");
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

    //[{"time": 800, "slots": [{jobid: , slotid: ""}]}
  });
