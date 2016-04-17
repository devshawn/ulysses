'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Volunteer = require('../volunteer/volunteer.model.js');

var SlotSchema = new mongoose.Schema({
  start: Number,
  end: Number,
  volunteers: [],
  locations: [],
  volunteersNeeded: Number,
  jobID: String,
  createdBy: String
});

export default mongoose.model('Slot', SlotSchema);
