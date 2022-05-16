const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const experimentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    sensors: {
        type: String
    },
    roomName: {
        type: String
    },
    roomPassword: {
        type: String
    },
    studentAnswer: [{
        type: Map
    }],
    video: {
        url: String,
        filename: String
    },
    data: {
        type: {type: Number},
        value: [Number]
    },
    startingTime: {
        minutes: Number,
        seconds: Number
    },
    date: {
        type: Date, 
        default: Date.now
    }
});


module.exports = mongoose.model('Experiment', experimentSchema);