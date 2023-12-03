const express = require("express");
const router = express.Router();

const UserController = require('../controllers/userController');


const jwtVerify = (req, res, next) => {
    const authToken = req.headers.authorization;
    if (authToken) {
      try {
        const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
        req.userId = decodedToken.userId; // Store decoded user ID in request object
        next();
      } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
      }
    } else {
      res.status(401).json({ message: 'No token provided' });
    }
  };


// Register a new user
router.post('/register', UserController.register);

// Log in a user
router.post('/login', UserController.login);

// Retrieve and update user preferences
router.get('/preferences',jwtVerify, UserController.getPreferences);
router.put('/preferences',jwtVerify, UserController.updatePreferences);

module.exports = router;
