require("dotenv").config();
require("./config/database").connect();
const express = require("express");



const userRouter = require("./routes/user");
const newsRouter = require("./routes/news");


const app = express();

app.use(express.json());


app.use("/users", userRouter);
app.use("/news", newsRouter);

app.get("/", (req, res) => {
    return res.status(200).send('Welcome to news aggr');
});


module.exports = app;
