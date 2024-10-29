const express = require('express');
const router = express.Router();
const {sendFriendRequest , respondFriendRequest, removeFriend} = require ('../controllers/friendcontroller');
const { ensureAuthenticated } = require ('../middleware/authmiddleware');

router.post('/respondrequest', ensureAuthenticated , respondFriendRequest);
router.post('/sendrequest' , ensureAuthenticated , sendFriendRequest);
router.delete ('/remove' ,ensureAuthenticated , removeFriend);

module.exports = router;