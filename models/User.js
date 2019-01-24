const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function generateJWT(id, email) {
    const today = new Date();
    const expirationDate = new Date(today);

    return jwt.sign({
        email: email,
        id: id,
        exp: parseInt( (expirationDate.getTime() + 300000) / 1000, 10),
    }, 'secret');
}

function toAuthJSON(id , email) {
    return {
      id: id,
      email: email,
      token: generateJWT(),
    };
  };

module.exports = {
  toAuthJSON: toAuthJSON,
  generateJWT: generateJWT,
};
  