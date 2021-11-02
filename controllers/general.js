const GoogleUser = require('../models/googleuser');
const { ExpressError } = require('../middleware');
const { cloudinary } = require('../cloudinary');

module.exports.get_profile = (req, res) => {
    res.render('general/profile', { user: req.user });
};

module.exports.get_settings = (req, res) => {
    res.render('general/settings', { user: req.user });
};


module.exports.settings_put = async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;
    const { name } = req.body;
    if (name.trim() === "" || name === null) {
        req.flash('error', 'Enter valid inputs');
        return res.redirect(`/settings`);
    }
    //    console.log(req.body);
    if (id === userid) {
        const { facebook, instagram, twitter } = req.body;
        if (facebook) {
            if (facebook.substring(0, 25) != 'https://www.facebook.com/' || facebook[facebook.length - 1] != '/') {
                req.flash('error', 'Enter links in given format.');
                return res.redirect('/settings');
            }
        }
        if (instagram) {
            if (instagram.substring(0, 26) != 'https://www.instagram.com/' || instagram[instagram.length - 1] != '/') {
                req.flash('error', 'Enter links in given format.');
                return res.redirect('/settings');
            }
        }

        if (twitter) {
            if (twitter.substring(0, 20) != 'https://twitter.com/' || twitter[twitter.length - 1] != '/') {
                req.flash('error', 'Enter links in given format.');
                return res.redirect('/settings');
            }
        }
        req.body.name = name.trim();
        const upuser = await GoogleUser.findByIdAndUpdate(id, req.body, { new: true });
        if (!req.body.interested) {
            upuser.interested = [];
            upuser.save();
        }

        req.flash('success', 'Updated your profile');
        return res.redirect('/profile');
    } else {
        req.flash('error', 'Not allowed to do that');
        res.redirect('/home');
    }
};


module.exports.addAdmin = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    if (email === null || email.trim() === '') {
        req.flash('error', 'Enter valid email');
        return res.redirect('/home');
    }

    const str = email.toString();
    const i = email.indexOf('.');
    const domain = str.substring(i + 1);
    if (domain !== 'iitism.ac.in') {
        req.flash('error', `Cannot access using this domain!`);
        return res.redirect('/home');
    }

    const userFound = await GoogleUser.findOne({ email });
    if (userFound) {
        if (userFound.isAdmin === false) {
            userFound.isAdmin = true;
            await userFound.save();
            req.flash('success', 'Added new admin');
            res.redirect('/home');
        } else {
            req.flash('error', 'Already admin!');
            res.redirect('/home');
        }

    } else {
        req.flash('error', 'Email not found');
        res.redirect('/home');
    }
};

module.exports.removeAdmin = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    if (email === null || email.trim() === '') {
        req.flash('error', 'Enter valid email');
        return res.redirect('/home');
    }
    const str = email.toString();
    const i = email.indexOf('.');
    const domain = str.substring(i + 1);
    if (domain !== 'iitism.ac.in') {
        req.flash('error', `Cannot access using this domain!`);
        return res.redirect('/home');
    }
    const userFound = await GoogleUser.findOne({ email });
    if (userFound) {
        if (userFound.isAdmin === true) {
            userFound.isAdmin = false;
            await userFound.save();
            req.flash('success', 'Removed admin');
            res.redirect('/home');
        } else {
            req.flash('error', 'Not an admin to remove!');
            res.redirect('/home');
        }

    } else {
        req.flash('error', 'Email not found');
        res.redirect('/home');
    }
};

module.exports.enrolledList = async (req, res) => {
    const user = await GoogleUser.findById(req.params.id);
    if (user.enrollIn.length > 0) {
        const u = await GoogleUser.findById(req.params.id, { enrollIn: 1 }).populate({ // passing  { enrollIn: 1 } to get only 'enrollIn' field 
            path: 'enrollIn',
            populate: {
                path: 'author',
            }
        });
        const Even = u.enrollIn;
        var events = [];
        for (let e of Even) {
            if (e.date.getTime() >= new Date().getTime()) {
                events.push(e);
            }
        }

        if (events.length !== 0) {
            res.render('home', { events });
        }
        else {
            req.flash('primary', 'Events you are enrolled in are completed!');
            res.redirect('/home');
        }
    } else {
        req.flash('error', 'Not enrolled in any event.');
        res.redirect('/home');
    }

};

module.exports.changePic = (async (req, res) => { // 'profilePic' -> same as name of input field.
    // only req.file has all the details of file added. upload.single() is given by multer to parse files.
    const { id } = req.params;

    if (id == req.user.id && req.file) {
        const user = await GoogleUser.findById(id);

        if (user.public_id != '') { // this is for first time change there will be no public id as image will not be in cloudinary
            await cloudinary.uploader.destroy(user.public_id); // remove the older pic from cloudinary
        }
        // refer to https://githubmemory.com/repo/cloudinary-labs/cloudinary-laravel/issues/40, *add public_id as a field in database column.*
        user.profilePicUrl = req.file.path;
        user.public_id = req.file.filename;
        await user.save();

        return res.redirect('/profile');
    } else {
        req.flash('error', 'Invalid Request!');
        return res.redirect(`/profile`);
    }
    //    }catch(e) {
    //     //    const msg = e.details.map(el => el.message).join(',');
    //     //    throw new ExpressError(msg, 400);
    //        res.send(e);
    //    }
}
);
