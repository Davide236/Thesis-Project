const Experiment = require('../models/Experiment');
const CryptoJS = require('crypto-js');


exports.searchExperiments = function(req, res) {
    const {searchQuery} = req.query;
    let response = experiments.filter(element => element.title.includes(searchQuery));
    res.render("SearchExperiments", {response, searchQuery});
}


exports.getLiveForm = function(res) {
    let url = Math.random().toString(36).substring(1,10).substring(1);
    res.render("CreateLiveForm", {url});
}

exports.createLive = async function(req, res) {
    const {expName, expDescription, sensors, roomPassword,roomName} = req.body;
    const experiment = await Experiment.findOne({roomName : roomName});
    /*
    if (experiment) {
        console.log(experiment);
        req.flash('error', 'A room with that name already exist, choose a different one');
        return res.redirect("/");
    }
    */
    const newExp = await new Experiment({
        author: req.user.id,
        name: expName,
        description: expDescription,
        sensors: sensors,
        roomName: roomName,
        roomPassword: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(roomPassword))
    });
    await newExp.save();
    res.render("LiveExperiment", {expName, expDescription, sensors, roomName, creator: true, username: req.user.fullName });
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
    res.render("LiveExperiment", {expName: experiment.name,expDescription: experiment.description, sensors: experiment.sensors ,roomName, creator: false, username: req.user.fullName});
}

exports.redirectToHomepage = function(req, res) {
    req.flash('success', 'You ended/left the stream');
    res.redirect('/');
}


exports.deleteRoom = async function(req, res) {
    const {room} = req.params;
    await Experiment.findOneAndDelete({roomName: room, author:req.user.id});
    req.flash('success', 'Stream ended successfully!');
    res.redirect('/');
}