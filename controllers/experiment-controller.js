require('dotenv').config();

const Experiment = require('../models/Experiment');
const CryptoJS = require('crypto-js');
const cloudinary = require('cloudinary').v2;

const fs = require('fs');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
})

exports.searchExperiments = async function(req, res) {
    const {searchQuery} = req.query;
    let response = await Experiment.find({name: searchQuery});
    res.render("SearchExperiments", {response, searchQuery});
}


exports.getLiveForm = function(res) {
    let url = Math.random().toString(36).substring(1,10).substring(1);
    res.render("CreateLiveForm", {url});
}

exports.createLive = async function(req, res) {
    const {expName, expDescription, sensors, roomPassword,roomName, videoDevice} = req.body;
    const experiment = await Experiment.findOne({roomName : roomName});
    if (experiment) {
        req.flash('error', 'A room with that name already exist, choose a different one');
        return res.redirect("/");
    }
    const newExp = await new Experiment({
        author: req.user.id,
        name: expName,
        description: expDescription,
        sensors: sensors,
        roomName: roomName,
        roomPassword: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(roomPassword))
    });
    await newExp.save();
    res.render("LiveExperiment", {expName, expDescription, sensors, roomName, creator: true, username: req.user.fullName, videoDevice });
}



exports.joinLive = async function(req, res) {
    const {roomPassword, roomName} = req.body;
    const experiment = await Experiment.findOne({roomName : roomName});
    if (!experiment) {
        req.flash('error', 'No room found');
        return res.redirect("/");
    }
    let password = CryptoJS.enc.Base64.parse(experiment.roomPassword).toString(CryptoJS.enc.Utf8);
    if (password != roomPassword) {
        req.flash('error', 'Wrong password');
        return res.redirect("/");
    }
    res.render("LiveExperiment", {expName: experiment.name,expDescription: experiment.description, sensors: experiment.sensors ,roomName, creator: false, username: req.user.fullName, videoDevice: 'none'});
}

exports.redirectToHomepage = function(req, res) {
    req.flash('success', 'You ended/left the stream');
    res.redirect('/');
}


exports.deleteRoom = async function(req, res) {
    const {room} = req.params;
    try {
        await Experiment.findOneAndDelete({roomName: room, author:req.user.id});
        res.status(200).send('Room deleted correctly');
    } catch(err) {
        res.status(400).send('Error deleting the room');
    }
}

exports.uploadExperiment = async function(req, res) {
    const {expName, expDescription, minutes, seconds} = req.body;
    const {expVideo, expData} = req.files;
    let url, filename = '';
    let rawdata = fs.readFileSync(expData[0].path);
    let parsedData = JSON.parse(rawdata);
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
            data: parsedData,
            video: {
                url: url,
                filename: filename
            }
        });
        await newExperiment.save();
        req.flash('success', 'Experiment saved successfully');
        res.redirect('/');
    } catch(err) {
        req.flash('error', 'Error in saving the experiment, try again');
        res.redirect('/');
    }
}