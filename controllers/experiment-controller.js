require('dotenv').config();

const Experiment = require('../models/Experiment');
const User = require('../models/User');
const CryptoJS = require('crypto-js');
//Require the module Cloudinary to save the videos
const cloudinary = require('cloudinary').v2;

const fs = require('fs');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

//Function which retrieves the experiments with a certain query in their title
exports.searchExperiments = async function(req, res) {
    const {searchQuery} = req.query;
    let response = await Experiment.find({name: {$regex: searchQuery, $options: 'i'}, video: {$exists: true, $ne: []}});
    res.render("SearchExperiments", {response, searchQuery});
}


//Function used to create a new live experiment stream
exports.createLive = async function(req, res) {
    const {expName, expDescription, dataType, roomPassword,roomName, videoDevice} = req.body;
    const experiment = await Experiment.findOne({roomName : roomName});
    //If there is already an existing experiment with the same roomName then the user is asked
    //to choose a different roomName for the live
    if (experiment) {
        req.flash('error', 'A room with that name already exist, choose a different one');
        return res.redirect("/");
    }
    //Create and save the experiment to Database
    const newExp = await new Experiment({
        author: req.user.id,
        name: expName,
        description: expDescription,
        roomName: roomName,
        dataType: dataType,
        roomPassword: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(roomPassword))
    });
    await newExp.save();
    res.render("LiveExperiment", {expName, expDescription, dataType, roomName, creator: true, username: req.user.fullName, videoDevice });
}


//Function which allows the user to join a live stream
exports.joinLive = async function(req, res) {
    const {roomPassword, roomName} = req.body;
    const experiment = await Experiment.findOne({roomName : roomName});
    //Check that a room with the given name exists
    if (!experiment) {
        req.flash('error', 'No room found');
        return res.redirect("/");
    }
    let password = CryptoJS.enc.Base64.parse(experiment.roomPassword).toString(CryptoJS.enc.Utf8);
    //Check if the password for the room is correct
    if (password != roomPassword) {
        req.flash('error', 'Wrong password');
        return res.redirect("/");
    }
    res.render("LiveExperiment", {expName: experiment.name,expDescription: experiment.description, dataType: experiment.dataType ,roomName, creator: false, username: req.user.fullName, videoDevice: 'none'});
}

//Function used to redirect users to the homepage
exports.redirectToHomepage = function(req, res) {
    req.flash('success', 'You ended/left the stream');
    res.redirect('/');
}

//Function used to delete a room once the livestream is over
exports.deleteRoom = async function(req, res) {
    const {room} = req.params;
    try {
        await Experiment.findOneAndDelete({roomName: room, author:req.user.id});
        res.status(200).send('Room deleted correctly');
    } catch(err) {
        res.status(400).send('Error deleting the room');
    }
}

//Function used to save an experiment to the Database and save it
exports.uploadExperiment = async function(req, res) {
    const {expName, expDescription, minutes, seconds, dataType} = req.body;
    //Get the video and files from the form (uploaded to Multer)
    const {expVideo, expData} = req.files;
    let url, filename = '';
    let rawdata = fs.readFileSync(expData[0].path);
    //Parse the JSON data to an array
    let parsedData = JSON.parse(rawdata);
    const data = parsedData.map(str => {
        return Number(str);
    });
    //Try to upload the video to Cloudinary to save it
    try {
        await cloudinary.uploader.upload(expVideo[0].path, {resource_type: 'video'}, function(err, data) {
            if (err) {console.warn(err);}
            if (!data) {return;}
            url = data.url;
            filename = data.public_id;
        });
        const newExperiment = await new Experiment({
            author: req.user.id,
            name: expName,
            description: expDescription,
            startingTime: {
                minutes: minutes,
                seconds: seconds
            },
            data: data,
            dataType: dataType,
            video: {
                url: url,
                filename: filename
            }
        });
        await newExperiment.save();
        req.flash('success', 'Experiment saved successfully');
        res.redirect('/');
    } catch(err) {
        console.log(err);
        req.flash('error', 'Error in saving the experiment, try again');
        res.redirect('/');
    }
}

//Function which shows a specific experiment given it's ID
exports.showExperiment = async function(req, res) {
    const {id} = req.params;
    const experiment = await Experiment.findById(id);
    if (!experiment) {
        req.flash('error', 'Error in retrieving the experiment');
        return res.redirect('/');
    }
    const user = await User.findById(experiment.author);
    res.render('Experiment', {experiment, user});
}