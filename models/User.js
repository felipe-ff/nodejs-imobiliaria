const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function generateJWT(id, email) {
    const today = new Date();
    const expirationDate = new Date(today);
    //expirationDate.setDate(today.getDate() + 600);

    //console.log(today.getDate().getTime());
    //console.log( (today.getDate() + 600).getTime() ) ;

    return jwt.sign({
        email: email,
        id: id,
        exp: parseInt( (expirationDate.getTime() + 30000) / 1000, 10),
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
  