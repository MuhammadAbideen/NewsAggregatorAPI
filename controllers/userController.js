// This assumes you have a user model and bcrypt & jwt configured.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../model/user");


const UserController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        preferences: [] // Assuming preferences field in your user model
      });

      // Save user to database
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Validate password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Create and send JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); // Change 'secret_key' to your secret
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  getPreferences: async (req, res) => {
    try {

      const userId = req.userId; // This should be extracted from the JWT token
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ preferences: user.preferences });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  updatePreferences: async (req, res) => {
    try {
      // Update user's preferences (assuming user is authenticated)
      const userId = req.userId; // This should be extracted from the JWT token
      const { preferences } = req.body;

      await User.findByIdAndUpdate(userId, { preferences });

      res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = UserController;


