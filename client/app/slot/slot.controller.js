'use strict';



angular.module('ulyssesApp')
  .controller('SlotCtrl', function ($scope, $state, $stateParams, Volunteer, Job, Slot, Auth, Location) {
    var self = this;
    self.success = false;
    self.error = false;
    self.locations = [];

    self.isSuccess = function () {
      return self.success;
    }

    self.isError = function () {
      return self.error;
    }

    self.jobTitles = [];

    Job.query().$promise.then(function(results) {
      results.forEach(function(job) {
        console.log("run");
        self.jobTitles.push({title: job.title, id: job._id});
      });
      console.log(self.jobTitles);
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

      //checks to see if two time slots overlap
    self.isConflict = function(slot1, slot2) {
      var start1 = parseInt(slot1.start);
      var end1 = parseInt(slot1.end);
      var start2 = parseInt(slot2.start);
      var end2 = parseInt(slot2.end);
      if((start1 <= start2 && start2 <= end1)) {
        console.log("scenario1");
        return true;
      }
      else if(start2 <= start1 && start1 <= end2) {
        console.log("scenario2");
        return true;
      }
      else if(start1 == start2 && end1 == end2)
      {
        console.log("scenario3");
        return true;
      } else {
        console.log("scenario4");
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

    self.getJobTitle = function(name) {
      var title;
      self.jobTitles.forEach(function(job) {

        if(job.id == name) {
          title = job.title;
        }

      });
      return title;
    }

    self.areThereSlots = function() {
      if(self.data) {
        return !(self.data.length == 0);
      }
    }


    self.removeSlot = function (slot) {
      if (confirm("Are you sure you want to delete? This will remove all volunteers from this time slot.")) {
        console.log("Deleting");

        var vols = slot.volunteers;
        vols.forEach(function(volunteer) {
          Volunteer.get({id: volunteer}, function(results) {
            var vol = results;
            var index = vol.slots.indexOf(slot._id);
            if(index > -1) {
              vol.slots.splice(index, 1);
            }
            console.log("updating");

            index = -1;
            var i = 0;
            vol.locations.forEach(function(location) {
              if(location.slotID == slot._id) {
                console.log("found");
                index = i;
              }
              i++;
            });

            if(index > -1) {
              vol.locations.splice(index, 1);
            }

            Volunteer.update({id: volunteer}, vol);
          });
        });

        Slot.remove({id: slot._id});
        var index = self.data.indexOf(slot);
        if (index > -1) {
          self.data.splice(index, 1);
        }
      }
    }

    if($state.current.name == "slot") {

      Slot.query().$promise.then(function(results) {
        self.data = results;
        self.data.forEach(function(slot) {
          slot["jobTitle"] = self.getJobTitle(slot.jobID);
          slot["left"] = slot.volunteersNeeded - slot.volunteers.length;
        })
      }, function (error) {
        console.log("ERROR");
      });

    } else if ($state.current.name == "slot-detail") {
      self.vols = [];
      self.exists = false;
      self.allLocations = [];
      self.locations = [];
      self.newLocations = [];
      self.readOnly = true;
      self.toDelete = [];

      self.isReadOnly = function() {
        return self.readOnly;
      }

      self.cancelUpdates = function() {
        $state.reload();
      }

      self.updateSlot = function() {
        console.log("updating");
        var data = [];
        var newCount = 0;
        var allGood = true;
        self.allLocations.forEach(function(location) {
          console.log(location.name, "value: ", location.value, "count: ", (location.oldValue - location.count))
          if(location.value < (location.oldValue - location.count)) {
            allGood = false;
          }
          if(location.value > 0) {
            newCount += location.value;
            data.push({'locationID' : location._id, 'value' : location.value});
          }
        });

        if(allGood) {
          if(newCount > 0) {
            Slot.update({id: self.slot._id}, {'volunteersNeeded' : newCount, 'locations' : data});

            self.toggleEdit();
            self.allLocations = [];
            self.newLocations = [];
            $state.reload();
          } else {
            self.success = false;
            self.error = true;
            self.errorMessage = "You must assign at least one location for this time slot.";
          }
        } else {
          self.success = false;
          self.error = true;
          self.errorMessage = "You currently have more volunteers assigned to a location than allowed.";
        }
      }

      self.chooseLocation = function() {
        if(self.locationToChoose) {
          var push = true;
          self.newLocations.forEach(function(loc) {
            if(self.locationToChoose == loc._id) {
              push = false;
              console.log("in");
            }
          });

          self.locations.forEach(function(loc) {
            if(self.locationToChoose == loc._id) {
              push = false;
              console.log("in2");
            }
          });

          self.allLocations.forEach(function(loc) {
            if(loc._id == self.locationToChoose && push) {
              self.newLocations.push(loc);
            }
          });
          self.locationToChoose = "";
        }
      }

      self.deleteLocation = function(location) {
        var canDelete = true;
        self.vols.forEach(function(vol) {
          vol.locations.forEach(function(loc) {
            if(loc.locationID == location._id) {
              canDelete = false;
            }
          })
        })
        console.log("deleting", location)
        if(canDelete) {
          var index = self.locations.indexOf(location);
          if(index > -1) {
            self.locations.splice(index, 1);
          }
          self.toDelete.push(location._id);
        } else {
          alert("You cannot remove a location that is assigned to a volunteer.");
        }

      }

      self.toggleEdit = function() {
        self.readOnly = !self.readOnly;
      }

      self.areThereLocations = function() {
        return self.locations.length > 0;
      }

      self.getLocations = function(response, callback) {
        var locs = response.locations;
        var inc = 0;
        var locations = [];
        locs.forEach(function(location) {
          Location.get({id: location.locationID}, function(results2) {
            inc++;
            results2.value = location.value;
            results2.count = location.value;
            results2.oldValue = location.value;
            locations.push(results2);
            self.allLocations.push(results2);
            if(inc == locs.length) {
              callback(locations);
            }
          });
        });
      }

      self.slot = Slot.get({id: $stateParams.id}, function (response) {
        self.exists = true;
        self.slot["left"] = self.slot.volunteersNeeded - self.slot.volunteers.length;
        Job.get({id: self.slot.jobID}, function(results2) {
          Location.query({}, function(results) {
            results2.locations.forEach(function(loc) {
              results.forEach(function(location) {
                if(location._id == loc) {
                  var alreadyAdded = false;
                  self.allLocations.forEach(function(l) {
                    if(l._id == loc) {
                      alreadyAdded = true;
                    }
                  });
                  if(!alreadyAdded) {
                    location.count = 0;
                    location.value = 0;
                    location.oldValue = 0;
                    self.allLocations.push(location);
                  }
                }
              });
            });
            console.log("T", self.allLocations);
          });
        });
        self.getLocations(response, function(locations) {
          self.locations = locations;
          var vols = self.slot.volunteers;
          vols.forEach(function(data) {
            Volunteer.get({id: data}).$promise.then(function(results) {
              results.locations.forEach(function(location) {
                if(location.slotID == self.slot._id) {
                  self.locations.forEach(function(location2) {
                    if(location2._id == location.locationID) {
                      location2.count--;
                      results.location = location2;
                    }
                  })
                }
              });
              self.vols.push(results);
            });
          });
        });
      });


      Volunteer.query({}, function(results) {
        results.forEach(function(volunteer) {
          volunteer.inSlot = false;
          volunteer.slots.forEach(function(slot) {
            if(slot == self.slot._id) {
              volunteer.inSlot = true;
            }
          });
        });
        self.volunteers = results;
      });

      self.doesSlotExist = function () {
        if(self.slot) {
          return self.exists;
        }
      }

      self.areThereAssignees = function() {
        if(self.vols) {
          return !(self.vols.length == 0);
        }
      }

      self.areThereVolunteers = function() {
        if(self.volunteers) {
          return !(self.volunteers.length == 0);
        }
      }

      self.inSlot = function(volunteer) {
        var val = false;
        if(self.slot.volunteers) {
          self.slot.volunteers.forEach(function(vol) {
            if(vol == volunteer) {
              console.log(true);
              val = true;
            }
          })

          return val;
        }
      }


      self.addVolunteer = function() {
        if(self.volunteer) {
          if(!self.slot.volunteers.includes(self.volunteer)) {
            if (self.location) {
              if (self.vols.length >= self.slot.volunteersNeeded) {
                self.error = true;
                self.errorMessage = "You cannot add more volunteers than needed.";
                self.success = false;
              } else {
                self.conflictLoop(self.slot, self.volunteer, function(success) {
                  if(success === true) {
                    self.error = true;
                    self.success = false;
                    self.errorMessage = "This person is already assigned to a time slot during this time period.";
                  } else {
                    self.slot.volunteers.push(self.volunteer);
                    Slot.update({id: $stateParams.id}, self.slot);
                    Volunteer.get({id: self.volunteer}).$promise.then(function (results) {
                      console.log("async finished");

                      Location.get({id: self.location}, function(results2) {
                        self.locations.forEach(function(loca) {
                          if(loca._id == self.location) {
                            loca.count--;
                          }
                        });
                        self.volunteers.forEach(function(vol2) {
                          if(vol2._id == self.volunteer) {
                            vol2.inSlot = true;
                          }
                        });

                        results.location = results2;
                        self.vols.push(results);
                        var vol = results;
                        vol.slots.push(self.slot._id);
                        vol.locations.push({"locationID" : self.location, "slotID" : self.slot._id});
                        Volunteer.update({id: vol._id}, vol);
                        self.slot["left"]--;
                        self.success = true;
                        self.error = false;
                        self.volunteer = "";
                        self.location = "";
                      });
                    }, function (error) {
                      console.log("ERROR");
                    });
                  }
                });
              }
            } else {
              self.error = true;
              self.success = false;
              self.errorMessage = "You must choose a location for this volunteer.";
            }
          } else {
            self.error = true;
            self.success = false;
            self.errorMessage = "You have already added this volunteer to this time slot.";
          }
        } else {
          console.log("err");
          self.error = true;
          self.success = false;
          self.errorMessage = "You must choose a volunteer to be added.";
        }
      }

      self.removeVolunteer = function(volunteer) {
        if (confirm("Are you sure you want to delete?")) {
          Slot.get({id: self.slot._id}, function(results) {
            var slot = results;
            var index = slot.volunteers.indexOf(volunteer._id);
            if(index > -1) {
              slot.volunteers.splice(index, 1);
            }
            Slot.update({id: self.slot._id}, slot);
          });

          Volunteer.get({id: volunteer._id}, function (results) {
            var vol = results;
            console.log(vol);
            var index = vol.slots.indexOf(self.slot._id);
            if (index > -1) {
              vol.slots.splice(index, 1);
            }
            console.log("updating");

            self.volunteers.forEach(function(vol2) {
              if(vol2._id == volunteer._id) {
                vol2.inSlot = false;
              }
            });

            index = -1;
            var i = 0;
            vol.locations.forEach(function(location) {
              if(location.slotID == self.slot._id) {
                self.locations.forEach(function(loca) {
                  if(loca._id == location.locationID) {
                    loca.count++;
                  }
                })
                console.log("found");
                index = i;
              }
              i++;
            });

            if(index > -1) {
              vol.locations.splice(index, 1);
            }

            Volunteer.update({id: volunteer._id}, vol);
          });

          self.slot.left++;

          var index = self.vols.indexOf(volunteer);
          if(index > -1) {
            self.vols.splice(index, 1);
          }

          index = self.slot.volunteers.indexOf(volunteer._id);
          if(index > -1) {
            self.slot.volunteers.splice(index, 1);
          }

        }
      }

    } else if($state.current.name == "slot-create") {

      self.error = false;
      self.success = false;
      self.singleJob = true;
      self.errorMessage = "";
      self.locations = [];
      self.newLocations = [];
      self.locationsToAdd = [];

      self.singleJob = true;
      self.jobs = [];
      self.job = Job.get({id: $stateParams.id}, function(results) {
        self.jobs.push(results)
        results.locations.forEach(function(location) {
          Location.get({id: location}, function(loc) {
            loc.value = 0;
            self.locations.push(loc);
          });
        });
      });

      Slot.query({jobID: $stateParams.id }).$promise.then(function(results) {
        self.data = results;
        self.data.forEach(function(slot) {
          slot["jobTitle"] = self.getJobTitle(slot.jobID);
          slot["left"] = slot.volunteersNeeded - slot.volunteers.length;
        })
      }, function (error) {
        console.log("ERROR");
      });

      self.chooseLocation = function() {
        if(self.locationToChoose) {
          var push = true;
          self.newLocations.forEach(function(loc) {
            if(self.locationToChoose == loc._id) {
              push = false;
            }
          });

          self.locations.forEach(function(loc) {
            if(loc._id == self.locationToChoose && push) {
              self.newLocations.push(loc);
            }
          });
          self.locationToChoose = "";
        }
      }

      self.removeLocation = function(location) {
        var index = self.newLocations.indexOf(location);
        if(index > -1) {
          self.newLocations.splice(index, 1);
        }
      }

      self.areThereLocations = function() {
        if(self.newLocations) {
          return self.newLocations.length > 0;
        }
      }

      self.errorMessage = "You cannot create a time slot for a non-existent job.";
      console.log(self.singleJob)

      self.createSlot = function () {
        console.log("clicked submit!");
        if(self.singleJob) {
          self.jobtitle = self.job._id;
        }
        if (self.start && self.jobtitle && self.end) {
            if(parseInt(self.start) < parseInt(self.end)) {
              // loop through locations and add them up
              var locs = [];
              var count = 0;
              self.locations.forEach(function(location) {
                if(location.value > 0) {
                  count += location.value;
                  locs.push({'locationID' : location._id, 'value' : location.value});
                }
              });

              console.log("locs", locs);
              console.log("count", count);
              if(locs.length > 0) {

                Slot.save({
                  start: self.start,
                  end: self.end,
                  volunteers: [],
                  locations: locs,
                  volunteersNeeded: count,
                  jobID: self.jobtitle,
                  createdBy: Auth.getCurrentUser()._id
                }, function(results) {
                  results["left"] = results.volunteersNeeded
                  self.data.push(results);
                });

                self.locations.forEach(function(location) {
                  location.value = 0;
                });
                self.error = false;
                self.jobtitle = "";
                self.start = "";
                self.end = "";
                self.success = true;
              } else {
                self.error = true;
                self.success = false;
                self.errorMessage = "You must enter volunteers needed for at least one location.";
              }
            } else if(parseInt(self.start) == parseInt(self.end)) {
              self.error = true;
              self.success = false;
              self.errorMessage = "Your start time and end time cannot be the same.";
            } else {
              self.error = true;
              self.success = false;
              self.errorMessage = "Your start time and end time are not in chronological order.";
            }
        } else {
          self.error = true;
          self.success = false;
          self.errorMessage = "You must fill out all of the required fields.";
        }
      }

    } else if($state.current.name == "slot-create-define") {
      self.error = false;
      self.success = false;
      self.singleJob = false;
      self.errorMessage = "";

      self.jobs = Job.query();
      self.errorMessage = "There are currently no entered jobs. To create a time slot, you must first create jobs.";

    }

    self.isSingleJob = function() {
      return self.singleJob;
    }

    self.canCreate = function () {
      console.log("asdf");
      if(self.jobs) {
        return !(self.jobs.length == 0);
      }
    }

  });
