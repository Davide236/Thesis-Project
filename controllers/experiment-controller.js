const Experiment = require('../models/Experiment');


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
    const {expName, expDescription, sensors, roomPassword, url} = req.body;
    const newExp = await new Experiment({
        author: req.user.id,
        name: expName,
        description: expDescription,
        sensors: sensors,
        roomName: roomPassword
    });
    await newExp.save();
    res.render("LiveExperiment", {expName, expDescription, sensors, roomPassword, creator: true, username: req.user.fullName });
}


exports.joinLive = async function(req, res) {
    const {roomPassword} = req.body;
    const experiment = await Experiment.findOne({roomName : roomPassword});
    if (!experiment) {
        req.flash('error', 'No room found');
        return res.redirect("/");
    }
    res.render("LiveExperiment", {expName: experiment.name,expDescription: experiment.description, sensors: experiment.sensors ,roomPassword, creator: false, username: req.user.fullName});
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