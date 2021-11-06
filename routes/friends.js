const express = require('express');
const router = express.Router();
const { isLoggedIn, catchAsyncError } = require('../middleware');

const friendController = require('../controllers/friends');

router.get('/addFollowing', isLoggedIn, catchAsyncError(friendController.addFollowingGet));

router.post('/add/:c_id/:f_id', isLoggedIn, catchAsyncError(friendController.addPost));

router.post('/remove/:c_id/:f_id', isLoggedIn, catchAsyncError(friendController.removePost));

router.get('/view/:f_id', isLoggedIn,  catchAsyncError(friendController.viewPro));

module.exports = router;