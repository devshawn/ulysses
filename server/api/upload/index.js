'use strict';

var express = require('express');
var controller = require('./upload.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.post('/', auth.hasRole('organizer'), controller.create);

module.exports = router;
