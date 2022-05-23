const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
//Database schema for the user. Email and password are handled by passport-local
const userSchema = new Schema({
    fullName: {
        type: String,
        unique: true,
        required: true
    },
    //Verifications for the user
    verification : {
        verified: {
            type: Boolean,
            default: false
        },
        secretToken : String,
        passwordReset: String
    }
});

//Adds username and password to the schema
userSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model('User', userSchema);