require('dotenv').config();
//Get all the different modules and the setups needed for App.js
const express = require('express'),
    path = require('path'),
    dataRoutes = require('../routes/data-router'),
    userRoutes = require('../routes/user-router'),
    app = express(),
    flash = require('connect-flash'),
    session = require('express-session'),
    secret = process.env.SECRET,
    DBController = require('./db-config');


const sessionConfig = {
    secret,
    resave: false,
    saveUninitialized: true
}


app.use(session(sessionConfig));
app.use(flash());
app.use(express.urlencoded({ extended: true })); // Body parser setup
app.set('view engine', 'ejs'); //use ejs as template
app.set('views', path.join(__dirname, '../views')); //set views directory
app.use(express.static(__dirname + '/../public/')); //set public directory
app.use("/data", dataRoutes);
app.use("/user", userRoutes);
DBController.setupDatabase();

//Flag for logged users and success/error flash messages
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

module.exports = app;