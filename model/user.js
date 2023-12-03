const mongoose = require("mongoose");

const userSchema = new mongoose.Schema
(
    {
        username: { type: String, default: null },
        email: { type: String, unique: true },
        password: { type: String },
        preferences: { type: String },
    }
);

 const User = mongoose.model("user", userSchema);
 module.exports = User;