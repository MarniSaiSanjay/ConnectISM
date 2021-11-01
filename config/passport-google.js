const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const { ExpressError } = require('../middleware');
const GoogleUser = require('../models/googleuser');


passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    GoogleUser.findById(id).then(user => {
        done(null, user); // // this 'user' object is passed to redirect url in routes.
    })
})


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/users/google/redirect/"
},
    async (accessToken, refreshToken, profile, email, done) => { // no need of using profile here.
        const { _json } = email;
        const {hd} = _json;
        if (hd) {
            const domain = hd.substring(hd.indexOf('.') + 1);
            if (domain !== 'iitism.ac.in') {
                done(new ExpressError('Cannot access using this domain!', 403));
            }
            else {
                const a = await GoogleUser.findOne({ googleId: email.id });
                if (a) {
                    done(null, a);
                } else {
                    const myArr = email.displayName.split(" ");
                    const name_changed = myArr.join('');
                    const newUser = new GoogleUser({
                        name: name_changed,
                        email: email.emails[0].value,
                        googleId: email.id,
                        profilePicUrl: email._json.picture,
                    });
                    newUser.save();
                    done(null, newUser);
                }
            }
        } else {
            done(new ExpressError('Cannot access using this domain!', 403));
            // done(new Error('expected error')) even this can be used if we don't have ExpressError defined.
        }
    }

));