const jwt = require('jsonwebtoken');
require('dotenv').config();


const tokenChecker = function(req, res, next) {
  // avoid infinite loop
  if (req.path === '/') {
    return next();
  }

  const cookie = req.cookies;

	// if there is no token
	if (!cookie.token) {
		return res.redirect('/');
	}

  // Verify the JWT token
  jwt.verify(cookie.token, process.env.SUPER_SECRET, (err, decoded) => {
    if (err) {
      // The token is invalid or expired
      res.redirect('/');
    } else {
      // The token is valid, decoded contains the decoded payload
      if (decoded.userId !== cookie.userId || decoded.email !== cookie.email) {
        // The token does not match the specified user
        return res.redirect('/');
      } else {
        // The token is valid and matches the specified user
        next();
      }
    }
  });
	
};


function verifyToken(cookie) {
  try {
      // if there is no token
      if (!cookie.token) {
          return false;
      }
      // Verify token
      const decoded = jwt.verify(cookie.token, process.env.SUPER_SECRET);
      if (decoded.userId !== cookie.id || decoded.email !== cookie.email) {
          return false;
      }
      // verified
      return true;
  } catch (error) {
      console.error('Error tokenChecking:', error.message);
      return false;
  }
}

// Esporta le funzioni separatamente
module.exports.tokenChecker = tokenChecker;
module.exports.verifyToken = verifyToken;