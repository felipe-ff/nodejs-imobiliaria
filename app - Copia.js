var express = require('express');
var config = require('./config');
const bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
const cors = require('cors');
const session = require('express-session');

jwt = require('jsonwebtoken'),
expressJwt = require('express-jwt'),

require('./models/User');
require('./config/passport');


// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: '393089547941137',
    clientSecret: 'cfe9b1180eed75eff2927b27db097020',
    callbackURL: '/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('OK');
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

const now = new Date();

app.use(cors());

app.disable('etag');
app.set('trust proxy', true);

app.use(require('body-parser').urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(session({ secret: 'passport-tutorial', cookie: { expires: new Date(now.getTime() + 1000) }, resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/books', require('./books/api'));


// Define routes.
app.get('/',
  function(req, res) {
    //res.render('home', { user: req.user });
    res.json("Home");
  });

app.get('/login',
  function(req, res){
    //res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    console.log(res);
    //res.redirect('/');
    res.redirect('http://localhost:4200');
  });

// Basic 404 handler
app.use((req, res) => {
  //res.redirect('/');
  //res.status(404).send('Not Found');
});

// Basic error handler
app.use((err, req, res) => {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  // Start the server
  const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
