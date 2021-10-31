const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor, isAdmin, catchAsyncError} = require('../middleware');

const {validateEvent} = require('../middleware');

const eventController  = require('../controllers/event');

// ADD EVENT
router.post('/', isLoggedIn, isAdmin, validateEvent, catchAsyncError(eventController.addEvent));

// edit form
router.get('/:id/edit', isLoggedIn, isAdmin, isAuthor, catchAsyncError(eventController.edit_form));

router.route('/:id')
        .put(isLoggedIn, isAdmin, isAuthor, validateEvent, catchAsyncError(eventController.update)) // update event in db
        .delete( isLoggedIn, isAdmin, isAuthor, catchAsyncError(eventController.delete));  // delete EVENT


// ENROLL
router.post('/:id/enroll', isLoggedIn, catchAsyncError(eventController.enroll_post));

// UNENROLL
router.post('/:id/unenroll', isLoggedIn, catchAsyncError(eventController.unenroll_post));

router.get('/:id/ecandidates', isLoggedIn, isAuthor, catchAsyncError(eventController.candidates));

router.get('/:id/profile/:profileid/view', isLoggedIn, isAuthor, catchAsyncError(eventController.candidate_profile));

module.exports = router;