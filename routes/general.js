const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor, isAdmin, catchAsyncError } = require('../middleware');

// for image upload
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary');
const { populate } = require('../models/event');
const upload = multer({ storage }); // store in 'storage' instead of some destination locally.

const { validateEvent, validateUser, checkInterested } = require('../middleware');

// controller
const generalController = require('../controllers/general');

router.get('/profile', isLoggedIn, generalController.get_profile);

router.get('/settings', isLoggedIn, generalController.get_settings);

router.put('/settings/:id', isLoggedIn, checkInterested, validateUser, catchAsyncError(generalController.settings_put));

router.post('/settings/:id/addadmin', isLoggedIn, isAdmin, catchAsyncError(generalController.addAdmin));

router.post('/settings/:id/removeadmin', isLoggedIn, isAdmin, catchAsyncError(generalController.removeAdmin));

// ALL ENROLLED EVENTS
router.get('/user/:id/enrolledList', isLoggedIn, catchAsyncError(generalController.enrolledList));

// 
router.post('/image/:id/propic', upload.single('profilePic'), catchAsyncError(generalController.changePic));

module.exports = router;