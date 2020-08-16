let jwt = require('jsonwebtoken');

const secret = "secret";
const validity = 60*60*24*30;

const createToken = function(username) {
    const token = jwt.sign({
        'sub': username
    }, secret, {
        expiresIn: validity
    });
    return token;
}


function verifyAccesstoken(token) {
    try {
        const jwt_payload  = jwt.verify(token, secret);
        return jwt_payload.sub;
    } catch(e) {
        return null;
    }
}

module.exports.createToken = createToken;
module.exports.verifyAccesstoken = verifyAccesstoken;