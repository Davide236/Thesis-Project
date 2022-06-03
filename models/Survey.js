const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema for the Surveys
const surveySchema = new Schema({
    answers: [
        {
            answer: String,
            explanation: String
        }
    ]
});


module.exports = mongoose.model('Survey', surveySchema);