const {leaveGroup , joinGroup , createGroup} = require('../controllers/groupcontroller');
const {ensureAuthenticated} = require('../middleware/authmiddleware');
const express = require('express');
const router = express.Router();

router.post('/create',ensureAuthenticated,createGroup);
router.post('/join', ensureAuthenticated,joinGroup);
router.post('/leave',ensureAuthenticated,leaveGroup);


module.exports = router;