const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

//const Users = mongoose.model('Users');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, (email, password, done) => {
  //Users.findOne({ email }) //PROCURAR NO MYSQL
  //  .then((user) => {
      const user = {id: 1, email: 'felipe.ferraz18@gmail.com'};  
      /* if(!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      } */
      return done(null, user);
  //  }).catch(done);
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey   : 'your_jwt_secret'
},
function (jwtPayload, cb) {

  //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
  //return UserModel.findOneById(jwtPayload.id)
  const user = {id: 1, email: 'felipe.ferraz18@gmail.com'};  
  return user;
}
));