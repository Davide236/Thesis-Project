const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema for the Experiments
const experimentSchema = new Schema({
    //Author ID of the experiemnt
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    //Name of the experiment
    name: {
        type: String,
        required: true
    },
    //Description of the experiment
    description: {
        type: String,
        required: true
    },
    //Name of the room for live experiments
    roomName: {
        type: String
    },
    //Password of the room for live experiments
    roomPassword: {
        type: String
    },
    //List of student answers for a given experiments
    studentAnswer: [{
        type: Map
    }],
    //Video of a saved experiment
    video: {
        url: String,
        filename: String
    },
    //Type of the recorded data of the experiment
    dataType: {
        type: String
    },
    //Data recorded during the experiment
    data: [Number],
    //Starting time (minutes/seconds) of the recording of data during the experiment
    startingTime: {
        minutes: Number,
        seconds: Number
    },
    //Upload data of the experiment
    date: {
        type: Date, 
        default: Date.now
    }
});


module.exports = mongoose.model('Experiment', experimentSchema);