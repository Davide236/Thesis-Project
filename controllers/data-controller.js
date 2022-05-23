const Experiment = require('../models/Experiment');

//Function which saves the answers of students (during a live stream) to the database
exports.addStudentAnswers = async function(req, res) {
    const {room} = req.params;
    const {answers} = req.body;
    let experiment = await Experiment.findOne({roomName: room});
    if (experiment && answers) {
        experiment.studentAnswer = Object.assign(answers);
        await experiment.save();
        return res.status(200).send("Experiment saved correctly");
    }
    res.status(400).send("Error in saving the experiments");
}

//Function which retrieves all the student answers during a certain live-stream
exports.getUserAnswers = async function(req, res) {
    const {room} = req.params;
    let experiment = await Experiment.findOne({roomName: room});
    if (experiment) {
        return res.status(200).send(experiment.studentAnswer);
    }
    res.status(404).send("Experiment not found");
}

//Function which retrieves all experiment who are saved on the website
exports.sendExperiments = async function(res) {
    let experiments = await Experiment.find({video: {$exists: true, $ne: []}});
    res.send(experiments);
}

//Function which retrieves and sends an experiment given it's ID
exports.getExperimentData = async function(req, res) {
    const {id} = req.params;
    const experiment = await Experiment.findById(id);
    if (! experiment) {
        return res.status(400).send('Did not find data for the experiment');
    }
    res.status(200).send(experiment.data);
}