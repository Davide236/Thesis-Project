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
        type: String,
        required: true
    },
    roomName: {
        type: String, 
        required: true
    }
});


module.exports = mongoose.model('Experiment', experimentSchema);