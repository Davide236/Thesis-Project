//Function that configures a new router element
exports.newRouter = function() {
    require('dotenv').config();
    //Get all the different modules and the setups needed for all different router.js
    const express = require('express'),
        router = express.Router(),
        passport = require('passport'),
        localStrategy = require('passport-local'),
        session = require('express-session'),
        secret = process.env.SECRET,
        User = require('../models/User'),
        bodyParser = require('body-parser'),
        flash = require('connect-flash');



    const sessionConfig = {
        secret,
        resave: false,
        saveUninitialized: true
    }

    router.use(session(sessionConfig));
    router.use(flash());
    router.use(bodyParser.json());
    router.use(passport.initialize());
    router.use(passport.session());
    passport.use(new localStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());


    //Flag for logged users and success/error flash messages
    router.use((req, res, next) => {
        res.locals.currentUser = req.user;
        res.locals.error = req.flash('error');
        res.locals.success = req.flash('success');
        next();
    });
    return [router,passport]
}

