const Event = require('./models/event');

module.exports.catchAsyncError = (fn) => { // it takes an async function, so argument is a function
    return (req, res, next) => {
        fn(req, res, next).catch(e => next(e));
    }
}

class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status || 404;
    }
}
module.exports.ExpressError = ExpressError;

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // 'isAuthenticated' is added to request object by passport.
        req.flash('error', 'Login to view resource');
        return res.redirect('/users/login');
    }
    else next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (event.author.equals(req.user._id)) {
        next();
    } else {
        req.flash('error', 'Not allowed to do that!');
        return res.redirect(`/home`);
    }
}

module.exports.isAdmin = async (req, res, next) => {
    if (req.user.isAdmin) {
        next();
    } else {
        req.flash('error', 'Not allowed to do that, as you are not an admin!');
        return res.redirect(`/home`);
    }
}

/* ------------------------------SCHEMAS---------------------------------- */

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//defining an extension on Joi.string() to escape html in inputs.
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) { 
                const clean = sanitizeHtml(value, { 
                    allowedTags: [], 
                    allowedAttributes: {}, 
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value }) // if cleaned and original value are not equal we return an error we defined above.
                return clean;
            }
        }
    }
});

const JOI = BaseJoi.extend(extension);


const eventSchema =  JOI.object({
        title: JOI.string().required().escapeHTML(),
        description: JOI.string().allow('').default('').escapeHTML(),
        date: JOI.date().required().greater('now'),
        venue: JOI.string().required().escapeHTML(),
        enrolled: JOI.array(),
        club: JOI.string().escapeHTML(),
});

module.exports.validateEvent = (req,res,next) => {
    const {error} = eventSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else {
        next();
    }
}

const UserSchema =  JOI.object({
    name: JOI.string().required().escapeHTML().trim(),
    email: JOI.string().required().escapeHTML(),
    googleId: JOI.string().escapeHTML(),
    profilePicUrl: JOI.string().escapeHTML(),
    profilePicfileName : JOI.string().allow('').default('').escapeHTML(),
    degree: JOI.string().default('undefined').escapeHTML(),
    isAdmin: JOI.boolean(),
    facebook: JOI.string().allow('').default('').escapeHTML(),
    instagram: JOI.string().allow('').default('').escapeHTML(),
    twitter: JOI.string().allow('').default('').escapeHTML(),
    interested: JOI.array(),
});

module.exports.validateUser = (req,res,next) => {
    const {error} = UserSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else next();
}

module.exports.checkInterested = (req,res, next) => { // this is to convert interested to array which will be a string if only 1 is selected, so that it will pass joi validations. 
    var { interested } = req.body;
    if( typeof(interested) == 'string'){
        var p = [];
        p.push(interested);
        req.body.interested = p;
    }
    next();
}


