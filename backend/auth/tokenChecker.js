const jwt = require('jsonwebtoken');
require('dotenv').config();



function verifyToken(cookies) {
    return new Promise((resolve, reject) => {
      // Verify the JWT token
      jwt.verify(cookies.token, process.env.SUPER_SECRET, (err, decoded) => {
        if (err) {
          // The token is invalid or expired
          reject('Invalid token');
        } else {
          // The token is valid, decoded contains the decoded payload
          if (decoded.userId !== cookies.userId || decoded.email !== cookies.email) {
            // The token does not match the specified user
            reject('Token does not match the user');
          } else {
            // The token is valid and matches the specified user
            resolve(decoded);
          }
        }
      });
    });
  }

module.exports = verifyToken;