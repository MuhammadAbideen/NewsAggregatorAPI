const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require('axios');

const router = express.Router();

const User = require("../model/user");

const jwtVerify = (req, res, next) => {
    const authToken = req.headers.authorization;
    if (authToken) {
      const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
      req.user = decodedToken;
    }
    next();
};

router.use(jwtVerify);

router.get("/", async (req, res) => {

    try {
        // Assuming preferences are retrieved from the authenticated user
        const userId = req.userId;
        const user = await User.findById(userId);
  
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        const { preferences } = user;
  
        // Fetch news articles based on user preferences from an external API
        const apiKey = process.env.YOUR_NEWS_API_KEY; // Replace with your news API key
        const baseUrl = 'https://newsapi.org/v2/top-headlines';
  
        const promises = preferences.map(async (preference) => {
          const response = await axios.get(baseUrl, {
            params: {
              category: preference, // Assuming preferences are categories (e.g., sports, technology)
              apiKey,
            },
          });
          return response.data.articles;
        });
  
        // Wait for all API requests to complete
        const articles = await Promise.all(promises);
  
        // Flatten the array of articles
        const flattenedArticles = articles.flat();
  
        res.status(200).json({ articles: flattenedArticles });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
});
  

router.post("/:id/read", async (req, res) => {
    const id = req.params.id;

});

router.post("/:id/favorite", async (req, res) => {
    const id = req.params.id;

});

router.get("/read", async (req, res) => {

});

router.get("/favorites", async (req, res) => {

});


module.exports = router;