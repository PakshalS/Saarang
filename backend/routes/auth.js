const express = require('express');
const router = express.Router();
const { spotifyLogin, spotifyCallback, logout } = require('../controllers/authcontroller');

router.get('/spotify', spotifyLogin);
router.get('/spotify/callback', spotifyCallback);
router.get('/logout', logout);

module.exports = router;
