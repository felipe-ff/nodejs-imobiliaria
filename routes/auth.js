const jwt = require('express-jwt');
var ab;
const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if(authorization && authorization.split(' ')[0] === 'Bearer') {
    req.isAuthenticated = true;
    return authorization.split(' ')[1];
  } else {
    req.isAuthenticated = false;
    return null;
  }
};

const auth = {
  required: jwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: 'secret', 
    credentialsRequired: false, 
    userProperty: 'payload'
  }), 
  /* function (err, req, res, next) {
    if (err.code === 'invalid_token') {
      console.log(err);
      return next(); //401 com e sem ''
    }
    return next(e);
  } */
};

module.exports = auth;