const mongoose = require("mongoose");

const userSchema = new mongoose.Schema
(
    {
        username: { type: String, default: null },
        email: { type: String, unique: true },
        password: { type: String },
        preferences: {
            type: [String], // Define preferences as an array of strings
            default: [],    // Default value as an empty array
        },
    }
);

 const User = mongoose.model("user", userSchema);
 module.exports = User;