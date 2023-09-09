const Event = require('../models/event');
const GoogleUser = require('../models/googleuser');

module.exports.addEvent = async (req, res) => {
    const { title, date, venue, club, description } = req.body;
    var event_time = new Date(date).getTime();

    if (!title || !date || !venue){
        req.flash('error', 'Please fill required fields.');
        res.redirect('/home');
    }
    else if (title.trim() === "" || title === null || date.trim() === '' || date === null || venue.trim() === '' || venue === null) {
        req.flash('error', 'Enter valid inputs!!');
        res.redirect(`/home`)
    }
    else if (event_time < new Date().getTime()) {
        req.flash('error', 'Please set a future time.');
        res.redirect('/home');
    }
    else {
        const newEvent = new Event({ title: title.trim(), date, venue: venue.trim(), club, description: description.trim() });
        newEvent.author = req.user.id;
        await newEvent.save();
        req.flash('success', 'Created new event')
        res.redirect('/home');
    }
};

module.exports.edit_form = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (event !== null) {
        res.render('event/update', { event });
    }
    else {
        req.flash('error', 'Event might be deleted or not yet made.');
        res.redirect('/home');
    }
};

module.exports.update = async (req, res) => {
    const { title, date, venue, club, description } = req.body;
    // console.log(req.body);
    var event_time = new Date(date).getTime();
    if (!title || !date || !venue) {
        req.flash('error', 'Please fill required fields.');
        res.redirect(`/event/${req.params.id}/edit`);
    }
    else if (title.trim() === "" || title === null || date.trim() === "" || date === null || venue.trim() === '' || venue === null) {
        req.flash('error', 'Enter valid inputs!');
        res.redirect(`/event/${req.params.id}/edit`)
    }
    else if (event_time < new Date().getTime()) {
        req.flash('error', 'Please set a future time.');
        res.redirect('/home');
    }
    else {
        const event = await Event.findByIdAndUpdate(req.params.id, { title: title.trim(), date, venue: venue.trim(), club, description: description.trim() }, { new: true });
        req.flash('success', 'Successfully updated the event');
        res.redirect(`/event/${req.params.id}/ecandidates`);
    }

};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    req.flash('success', 'Deleted the event');
    res.redirect('/home');
};

module.exports.enroll_post = async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (event !== null) {
        const i = req.user.id;
        if (event.author === i) {
            req.flash('error', 'You are the host..');
            res.redirect('/home');
        } else if (event.date < new Date()) {
            req.flash('error', 'Event is completed!');
            res.redirect('/home');
        }
        else {
            for (let c of event.enrolled) {
                if (c == i) { // already enrolled
                    req.flash('error', 'Already enrolled');
                    return res.redirect('/home');
                }
            }
            event.enrolled.push(i);
            await event.save();

            // adding this event to user.
            const user_id = req.user.id;
            const user = await GoogleUser.findById(user_id);
            user.enrollIn.push(id);
            await user.save();

            // console.log(user);
            req.flash('success', 'Enrolled succesfully');
            res.redirect('/home');
        }
    } else {
        req.flash('error', 'Event might be deleted or not yet made.');
        res.redirect('/home');
    }

};

module.exports.unenroll_post = async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (event !== null) {
        const i = req.user.id;
        if (event.author === i) {
            req.flash('error', 'You are the host..');
            res.redirect('/home');
        } else if (event.date < new Date()) {
            req.flash('error', 'Event is completed!');
            res.redirect('/home');
        }
        else {
            for (let c of event.enrolled) {
                if (c == i) { // already enrolled
                    await Event.findByIdAndUpdate(id, { $pull: { enrolled: i } });  // no need to save this as it pulls and updates it.
                    await GoogleUser.findByIdAndUpdate(i, { $pull: { enrollIn: id } });
                    req.flash('success', 'Unenrolled successfully!');
                    return res.redirect('/home');
                }
            }
            req.flash('error', 'Not enrolled to unenroll');
            res.redirect('/home');
        }
    }
    else {
        req.flash('error', 'Event might be deleted or not yet made.');
        res.redirect('/home');
    }

};

module.exports.candidates = async (req, res) => { // enrolled candidates list for an event
    const { id } = req.params;
    const event = await Event.findById(id).populate('enrolled').populate('author');
    if (event !== null) {
        res.render('general/enrolledList', { event });
    }
    else {
        req.flash('error', 'Event might be deleted or not yet made.');
        res.redirect('/home');
    }
};

module.exports.candidate_profile = async (req, res) => { // route to view candidate profile
    const user = await GoogleUser.findById(req.params.profileid);
    res.render('general/viewprofile', { user });
};
