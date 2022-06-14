const Experiment = require('../models/Experiment');
const Survey = require('../models/Survey');

//Function which saves the answers of students (during a live stream) to the database
exports.addStudentAnswers = async function(req, res) {
    const {room} = req.params;
    const {answers} = req.body;
    let experiment = await Experiment.findOne({roomName: room});
    if (experiment && answers) {
        experiment.studentAnswer = Object.assign(answers);
        await experiment.save();
        return res.status(200).send(" Student answers saved correctly");
    }
    return res.status(400).send("Error in saving the answers");
}

//Function which retrieves all the student answers during a certain live-stream
exports.getUserAnswers = async function(req, res) {
    const {room} = req.params;
    let experiment = await Experiment.findOne({roomName: room});
    if (experiment) {
        return res.status(200).send(experiment.studentAnswer);
    }
    return res.status(404).send("Experiment not found");
}

//Function which retrieves all experiment who are saved on the website
exports.sendExperiments = async function(res) {
    let experiments = await Experiment.find({video: {$exists: true, $ne: []}});
    if (experiments) {
        return res.status(200).send(experiments);
    }
    return res.status(400).send('Failed to find any experiments, try again later');
}

//Function which retrieves and sends an experiment given it's ID
exports.getExperimentData = async function(req, res) {
    const {id} = req.params;
    const experiment = await Experiment.findById(id);
    if (! experiment) {
        return res.status(400).send('Did not find data for the experiment');
    }
    return res.status(200).send(experiment.data);
}

//Function which gets the data from a survey and saves it to the database
exports.saveSurvey = async function(req, res) {
    //Get the keys of all the answers
    let keys = Object.keys(req.body);
    let saved_answers = [];
    for (let i = 0; i < keys.length; i++) {
        let value = req.body[keys[i]];
        //If it's a no answer then it might also have an explanation to it
        if (value == 'no' || value == 'yes' || value == 'skip') {
            i++;
            let explanation = req.body[keys[i]];
            saved_answers.push({'answer': value, 'explanation': explanation});
        } else {
            //It's a 1-5 answer
            saved_answers.push({'answer': value, 'explanation': ''});
        }
    }
    let survey = await new Survey();
    survey.answers = saved_answers;
    await survey.save();
    res.redirect('/');
}