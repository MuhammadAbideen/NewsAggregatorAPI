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
      req.userId = decodedToken.userId;
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


const fetchArticleFromAPI = async (id) => {
  try {
    // Replace 'YOUR_NEWS_API_KEY' with the actual API key from your environment variables

    
    const apiKey = process.env.YOUR_NEWS_API_KEY; // Replace with your news API key
    const baseUrl = 'https://newsapi.org/v2';

    // Construct the URL to fetch articles from a specific news source
    const apiUrl = `${baseUrl}/everything?sources=${id}&apiKey=${apiKey}`;

    // Make a GET request to fetch articles from the specified news source
    const response = await axios.get(apiUrl);

    // Assuming the API response contains the article data
    const article = response.data;

    return article;
  } catch (error) {
    // Handle any errors (e.g., network issues, API errors)
    console.error('Error fetching article:', error.message);
    throw new Error('Failed to fetch article');
  }
};


  
// In-memory cache initialization
const newsCache = new Map();

// Routes setup
router.post("/:id/read", async (req, res) => {
    try {
        const { id } = req.params;
        // Get article from cache or external API if not cached
        let article = newsCache.get(id);
        if (!article) {
          // Fetch article from external API (assuming fetchArticleFromAPI is implemented)
          article = await fetchArticleFromAPI(id);
          // Cache the article
          newsCache.set(id, article);
        }
        // Mark as read (set a property in the article object)
        article.read = true;
        res.status(200).json({ message: 'Article marked as read', article });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }

});

router.post("/:id/favorite", async (req, res) => {
    try {
        const { id } = req.params;
        // Get article from cache or external API if not cached
        let article = newsCache.get(id);
        if (!article) {
          // Fetch article from external API (assuming fetchArticleFromAPI is implemented)
          article = await fetchArticleFromAPI(id);
          // Cache the article
          newsCache.set(id, article);
        }
        // Mark as favorite (set a property in the article object)
        article.favorite = true;
        res.status(200).json({ message: 'Article marked as favorite', article });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }

});

router.get("/read", async (req, res) => {
    try {
        // Filter articles in cache for 'read' property
        const readArticles = Array.from(newsCache.values()).filter(article => article.read);
        res.status(200).json({ readArticles });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
});

router.get("/favorites", async (req, res) => {
    try 
    {
        // Filter articles in cache for 'favorite' property
        const favoriteArticles = Array.from(newsCache.values()).filter(article => article.favorite);
        res.status(200).json({ favoriteArticles });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;