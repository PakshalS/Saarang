const {leaveGroup , joinGroup , createGroup, transferAdminRights, addUserFromFriends, removeUserFromGroup} = require('../controllers/groupcontroller');
const {ensureAuthenticated} = require('../middleware/authmiddleware');
const express = require('express');
const router = express.Router();

router.post('/create',ensureAuthenticated,createGroup);
router.post('/join', ensureAuthenticated,joinGroup);
router.post('/leave',ensureAuthenticated,leaveGroup);
router.post('/transferadminrights', ensureAuthenticated , transferAdminRights);
router.post('/addfriendstogroup', ensureAuthenticated , addUserFromFriends);
router.delete('/removeuser', ensureAuthenticated , removeUserFromGroup);

module.exports = router;