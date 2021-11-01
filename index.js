if (process.env.NODE_ENV != "production") { // if the environment we are running on is not 'production' (i.e. 'development'), then require the 'dotenv' package and take the variables we added there add them into 'process.env' in this node app. In production we don't do in this way.
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');  
const ejsMate = require('ejs-mate');

// session
const session = require('express-session');
const MongoStore = require('connect-mongo'); // using mongo to store sessions

const flash  = require('connect-flash');
// app.use(flash()); // req.flash() -> requires sessions

const {ExpressError} = require('./middleware');

// security
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// validations
const JOI = require('joi');

// for passport
const passport = require('passport');
const LocalStrategy = require('passport-local');
const googleStrategy = require('./config/passport-google');

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/ismConnect';


mongoose.connect( dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

// const User = require('./models/user');
const {isLoggedIn} = require('./middleware');
const Event = require('./models/event');

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// SECURITY
// app.use(mongoSanitize()); // not allow keys containing any periods (.) or $ in req.body, req.query or req.params .
app.use(
    mongoSanitize({
      replaceWith: ' ',
    }),
);

app.use(helmet());  

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://use.fontawesome.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    // "https://kit.fontawesome.com/04a114867e.js"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "*.fontawesome.com",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "*.fontawesome.com"
];
const fontSrcUrls = [
    " *.fontawesome.com",
    "https://fonts.gstatic.com"
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'",  ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/diaeuyinc/", 
                "https://lh3.googleusercontent.com", // to load google photos that I used from gmail.
                "https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["'self'"]
        },
    })
);

const secret = process.env.SECRET || 'thisisasecret';
// const store = new MongoStore({
//     mongoUrl: dbURL,
//     secret: secret,
//     touchAfter: 24*3600 // in sec, to update information in session after 24*3600 sec, if no change is made instead of updating every time.
// });

// store.on('error', function(e){
//     console.log('Session store error', e);
// })

// for passport:
app.use(session({
    // store: store,  // now mongo will be used to store sessions.
    store: MongoStore.create({
        mongoUrl: dbURL,
        secret: secret,
        touchAfter: 24*3600
    }),
    name: 'ISMconnect',
    secret,
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    cookie:{
        httpOnly: true,
        maxAge:1000*60*60*24*7
    }
})
);
app.use(passport.initialize());
app.use(passport.session());

// for flash
app.use(flash()); // should be done after session

// GLOBAL VARS:
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // 'req.user' will be a true if user is loggedIn
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.primary = req.flash('primary');
    next();
})

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    next();
});

app.get('/home', isLoggedIn,  async (req,res) => {
    const { club, completed } = req.query; 
if(club) {
    const current_time = new Date();
     const events = await Event.find({club, date: {$gt: current_time}}).populate('author', 'name').sort({date: 1});
     if(events.length!=0) res.render('home', { events });
     else {
        req.flash('error', `No upcoming events by ${club}`);
        res.redirect('/home');
     }
}
else if(completed === 'true'){
    const current_time = new Date().getTime();
    const events = await Event.find({ date: { $lt: current_time }}).populate('author', 'name').sort({date: -1});
     if(events.length!=0) res.render('home', { events });
     else {
        req.flash('error', `No completed events.`);
        res.redirect('/home');
     }
}
 else{ // There is no query string so it is just '/home' so show all. 
    const current_time = new Date().getTime();
    const events = await Event.find({date: { $gt: current_time }}).populate('author', 'name').sort({date: 1}); 
    // To specify ascending order for a field, set the field to 1 in the sort document; -1 for descending order.
   // now events are sorted so that earliest will be 1st and then passed to that ejs.
    res.render('home', {events});
}
});

// ROUTES:
// Authentication:
app.use('/users', require('./routes/auth'));
app.use('/event', require('./routes/event'));
app.use('/', require('./routes/general'));


//404 ROUTE:
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404));
})


//  ERROR HANDLER:
app.use((err, req, res, next) => {
    if (!err.status) err.status = 500;
    if (!err.message) err.message = 'Something went wrong!';
    res.render('error', {err});
})

const port = process.env.PORT || 3000;
app.listen(port);



