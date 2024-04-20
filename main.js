/* 
    Requiring dependencies
*/
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AWS = require("@aws-sdk/client-s3");
const cookieParser = require("cookie-parser");
const authController = require("./src/controllers/authController");
var pjson = require('./package.json');

/*
    Global variables
*/
const app = express();
const env = dotenv.config();

/* 
    Set/use express functions
*/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(flash({ sessionKeyName: "flashMessage" }));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        }
    })
);

/* 
    Requiring routes
*/
app.use("/", require("./src/routes/index"));
app.use("/", require("./src/routes/auth"));
app.get("/*", authController.isLoggedIn, (req, res) => {
    res.render("404", {
        user: req.user,
        pjson,
    });
});

/* 
    Start server w/ database
*/
mongoose.connect(process.env.MONGODB_URI).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server Started; Listening On Port ${process.env.PORT}`)
    });
    console.log("MongoDB Connection Successful");
}).catch((err) => {
    console.log(err);
});