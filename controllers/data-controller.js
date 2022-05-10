const Experiment = require('../models/Experiment');


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


exports.getUserAnswers = async function(req, res) {
    const {room} = req.params;
    let experiment = await Experiment.findOne({roomName: room});
    if (experiment) {
        return res.status(200).send(experiment.studentAnswer);
    }
    res.status(404).send("Experiment not found");
}