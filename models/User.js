const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {
        type: String,
        unique: true,
        required: true
    },
    verification : {
        verified: {
            type: Boolean,
            default: false
        },
        secretToken : String,
        passwordReset: String
    }
});

userSchema.plugin(passportLocalMongoose); //adds username and password

module.exports = mongoose.model('User', userSchema);