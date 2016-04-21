'use strict';

angular.module('ulyssesApp')
  .controller('JobCtrl', function ($scope, $state, $stateParams, Job, Slot, Auth, Volunteer, Location, $anchorScroll, $timeout) {
    var self = this;
    self.error = false;
    self.success = false;
    self.readOnly = true;
    self.locations = [];
    self.newLocations = [];

    self.isSuccess = function () {
      return self.success;
    }

    self.isError = function () {
      return self.error;
    }

    self.areThereLocations = function() {
      if(self.locations) {
        return !(self.locations.length == 0);
      }
    }

    self.areThereNewLocations = function() {
      if(self.newLocations) {
        return !(self.newLocations.length == 0);
      }
    }

    self.createLocations = function(loc2, callback) {
      var inc = 0;
      var data = [];
      console.log("Loc: " + loc2);
      loc2.forEach(function(location) {
        console.log("New!");
        var loc = new Location({name: location});
        loc.$save(function(item, response) {
          console.log("saved");
          inc++;
          data.push(item);
          if(inc == loc2.length) {
            callback(data);
          }
        });
      });
    }

    if($state.current.name == "job") {

      self.data = [];
      self.data = Job.query();

      self.areThereJobs = function() {
        if(self.data) {
          return !(self.data.length == 0);
        }
      }

      self.removeJob = function (job) {
        if(confirm("Are you sure you want to delete? This will delete all time slots associated with this job.")) {
          console.log("Deleting");

          job.locations.forEach(function(location) {
            Location.remove({id: location});
          });

          Slot.query({jobID: job._id}, function(results) {
            var slots = results;
            var test = [];
            slots.forEach(function(slot) {
              test.push(slot._id);
            });

            slots.forEach(function(slot) {
              slot.volunteers.forEach(function (volunteer) {
                Volunteer.get({id: volunteer}, function (results2) {
                  var vol = results2;
                  test.forEach(function(slotid) {
                    var index = vol.slots.indexOf(slotid);
                    if (index > -1) {
                      vol.slots.splice(index, 1);
                    }

                    index = -1;
                    var i = 0;
                    vol.locations.forEach(function (location) {
                      if (location.slotID == slotid) {
                        index = i;
                      }
                      i++;
                    });

                    if (index > -1) {
                      vol.locations.splice(index, 1);
                    }
                  });
                  Volunteer.update({id: volunteer}, vol);
                });
              });
              Slot.remove({id: slot._id});
            });
          });

          Job.remove({id: job._id});
          var index = self.data.indexOf(job);
          if(index > - 1) {
            self.data.splice(index, 1);
          }
        }
      }

    } else if($state.current.name == "job-create") {
      self.jobtitle = "";
      self.description = "";

      self.addLocation = function() {
        if(self.location.length >= 1) {
          self.locations.push(self.location);
          self.location = "";
        }
      }

      self.removeLocation = function(index) {
        self.locations.splice(index, 1);
      }

      self.createJob = function() {
        if(self.jobtitle.length >= 1 && self.description.length >=1) {
          if(self.locations.length >= 1) {
            console.log("Clicked submit!");

            self.createLocations(self.locations, function(data2) {
              var dt = [];
              data2.forEach(function(data) {
                dt.push(data._id);
              });
              var data = { title: self.jobtitle, description: self.description, createdBy: Auth.getCurrentUser()._id, locations: dt };
              Job.save(data);

              self.jobtitle = "";
              self.description = "";
              self.locations = [];
              self.error = false;
              self.success = true;
            });
          } else {
            self.error = true;
            self.success = false;
            self.errorMessage = "You must enter at least one location for this job."
          }
        } else {
          self.error = true;
          self.success = false;
          self.errorMessage = "You must fill out all of the required fields.";
        }

      }

    } else if($state.current.name == "job-detail") {
      self.newLocations = [];
      self.exists = false;
      self.job = Job.get({id: $stateParams.id}, function(results) {
        self.exists = true;
        results.locations.forEach(function(location) {
          Location.get({id: location}, function(results2) {
            self.locations.push(results2);
          });
        });
      });
      Slot.query({jobID: $stateParams.id}, function(response) {
        self.slots = response;
        self.slots.forEach(function(slot) {
          slot["left"] = slot.volunteersNeeded - slot.volunteers.length;
        });
      });

      self.doesJobExist = function() {
        if(self.job) {
          return self.exists;
        }
      }

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

      self.addLocation = function() {
        console.log("Adding location");
        if(self.location.length >= 1) {
          self.newLocations.push(self.location);
          self.location = "";
        }
      }

      self.removeLocation = function(location) {
        if (self.locations.length > 1) {
          if (location._id) {
            Slot.query({'jobID' : self.job._id}, function(results) {
              var error = false;
              results.forEach(function(slot) {
                slot.locations.forEach(function(location2) {
                  if(location._id == location2.locationID) {
                    error = true;
                  }
                });
              });

              if(error) {
                console.log("dont delete");
                alert("You cannot delete this location as it is assigned to a time slot.");
              } else {
                var index = self.job.locations.indexOf(location._id);
                if (index > -1) {
                  self.job.locations.splice(index, 1);
                }
                Job.update({id: self.job._id}, self.job);
                Location.remove({id: location._id});
                var index = self.locations.indexOf(location);
                if (index > -1) {
                  self.locations.splice(index, 1);
                }
              }
            })
          } else {
            var index = self.locations.indexOf(location);
            if (index > -1) {
              self.locations.splice(index, 1);
            }

            index = self.newLocations.indexOf(location.name);
            if (index > -1) {
              self.newLocations.splice(index, 1);
            }
          }
        } else {
          alert("You must have at least one location for a job.");
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
              Volunteer.update({id: volunteer}, vol);
            });
          });

          Slot.remove({id: slot._id});
          var index = self.slots.indexOf(slot);
          if (index > -1) {
            self.slots.splice(index, 1);
          }
        }
      }

      self.isReadOnly = function() {
        return self.readOnly;
      }

      var temp;

      self.toggleEdit = function () {
        self.readOnly = !self.readOnly;
      }

      self.updateJob = function() {
        console.log("updating");
        console.log(self.newLocations)
        if(self.job.title.length > 1 && self.job.description.length > 1) {
          self.locations.forEach(function(location) {
            Location.update({id: location._id}, {'name' : location.name});
          });

          if(self.newLocations.length >= 1) {
            self.createLocations(self.newLocations, function (data2) {
              console.log("finished");
              data2.forEach(function (loc) {
                var index = -1;
                var i = 0;
                self.locations.forEach(function (location) {
                  if (location.name == loc.name) {
                    index = i;
                  }
                  i++;
                });

                if (index > -1) {
                  self.locations.splice(index, 1);
                }
                self.locations.push(loc);
                self.job.locations.push(loc._id);
              });
              var job = {title: self.job.title, description: self.job.description, locations: self.job.locations};
              Job.update({id: $stateParams.id}, job);
              self.newLocations = [];
              self.success = true;
              self.error = false;
              self.toggleEdit();
              $anchorScroll();
            });
          } else {
            var job = {title: self.job.title, description: self.job.description};
            Job.update({id: $stateParams.id}, job);
            self.newLocations = [];
            self.success = true;
            self.error = false;
            self.toggleEdit();
            $anchorScroll();
          }
        } else {
          self.success = false;
          self.error = true;
          $anchorScroll();
        }
      }

      self.cancelUpdates = function() {
        console.log("Cancel");
        self.locations = [];
        self.job = Job.get({id: $stateParams.id}, function(results) {
          self.exists = true;
          results.locations.forEach(function(location) {
            Location.get({id: location}, function(results2) {
              self.locations.push(results2);
            });
          });
        });
        self.newLocations = [];
        self.toggleEdit();
        self.success = false;
        self.error = false;
        $anchorScroll();
      }

      self.areThereSlotsHere = function() {
        if(self.slots && self.slots.length > 0) {
          return true;
        } else {
          return false;
        }
      }
    }
  });
