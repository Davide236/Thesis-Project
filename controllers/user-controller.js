const User = require('../models/User');
const transport = require('../configuration/email-config');
const { v4: uuidV4 } = require('uuid');

//Function which logs in a user
exports.userLogin = function(req) {
    //Check if the users' account has already been verified
    if (req.user.verification.verified == false) {
        return {code: '403', message: 'you need to verify your email first to access your account' }
    }
    return {code: '200', message: 'You logged in successfully!'};
}


//Function which takes care of the signing up for the user
exports.userSignup = async function (req) {
    const {fullName, username, password} = req.body;
    const user = new User({fullName, username});
    try {
        const newUser = await User.register(user, password);
        //Create a secret token for the email verification
        const secretToken = uuidV4();
        newUser.verification.secretToken = secretToken;
        await newUser.save();
        //Send confirmation email
        await transport.sendMail({
            from: process.env.EMAIL,
            to: newUser.username,
            subject: 'Science Twins email verification',
            html: `
            <h1>Register on Science Twins</h1>
            <p>Hello ${newUser.fullName}, thank you for your registration on our website. <br/><br/>
            The last step in the registration process is to verify your email by clicking on the following link: <br/>
            On the following page: <a href="https://chemical-twins.herokuapp.com/user/verifyemail/${secretToken}">Email Verification</a><br/><br/>
            From the staff of Science Twins, we wish you a great time on our application!</p>`, 
        });
        return {code: '200', message: 'Account Completed, now you only need to verify your email!'};
    } catch(e) {
        console.log(e);
        return {code: '400', message: 'Unexpected error in saving your account, try again'};
    }
}

//Function for user logout
exports.userLogout = function(req) {
    try {
        req.logout();
        return {code: '200', message: 'You logged out your account'}
    } catch(_e) {
        return {code: '400', message: 'An error occurred, try again!'};
    }
}

//Function that implements the email verification for the users
exports.verifyEmail = async function(req) {
    const {secretToken} = req.params;
    const user = await User.findOne({'verification.secretToken': secretToken});
    //Check if the user exists
    if (!user) {
        return {code: '404', message: 'Wrong url, contact the team to get help with your verification'};
    }
    try {
        //Change the users' status to verified
        user.verification.verified = true;
        user.verification.secretToken = '';
        await user.save();
        return {code: '200', message: 'Email verified correctly!'};
    } catch(err) {
        return {code: '400', message: 'Error in verifying you account'};
    }
}


//Function which edits an account of a user
exports.editAccount = async function(req) {
    const {fullName, password} = req.body;
    const user = await User.findById(req.user.id);
    if (fullName) {
        user.fullName = fullName
    }
    if (password) {
        await user.setPassword(password);
    }
    try {
        await user.save();
        return {code: '200', message:'Changes Applied Correctly'};
    } catch (err) {
        return {code: '400', message:'Error in saving the changes to your account'};
    }
}

//Function which deletes the account of a user given its' ID
exports.userDelete = async function(req) {
    try {
        const userID = req.user.id;
        req.logout();
        await User.deleteOne({_id: userID});
        return {code :'200', message: 'Account deleted successfully'};
    } catch (err) {
        return {code: '400', message: 'Couldnt delete your account, try again'};
    }
}

//Function which sets a new password for a user
exports.setNewPassword = async function(req) {
    const {secretToken} = req.params;
    const {password} = req.body;
    //Find the user corresponding to the token
    const user = await User.findOne({'verification.passwordReset': secretToken});
    if (!user) {
        return {code: '404',message: 'Error in finding your accound, try again'};
    }
    try {
        user.verification.passwordReset = '';
        await user.setPassword(password);
        await user.save();
        return {code: '200', message: 'Password changed correctly! Try to login to your account again'};
    } catch(err) {
        return {code: '400',message:  'There was an error in changing your password, try again'};
    }
}


//Function which sends an email to user to reset their password
exports.resetPassword = async function(req, res) {
    const {username} = req.body;
    const user = await User.findOne({username});
    const secretToken = uuidV4();
    if (!user) {
        return {code: '404', message: 'An account with this email doesnt exist'};
    }
    user.verification.passwordReset = secretToken;
    try {
        await user.save();
        //Send email to user to reset their password
        await transport.sendMail({
            from: process.env.EMAIL, to: username, subject: 'Science twins new password',
            html: `
            <h1>Reset your Science Twins password </h1>
            Hello ${user.fullName},
            To reset your password for the website <br> Science Twins click on the following link: <a href="https://chemical-twins.herokuapp.com/user/newpassword/${secretToken}">New password</a>
            <br>`, 
        });
        return {code: '200', message: 'An email was sent to your account to get a new password'};
    } catch(err) {
        return {code: '400', message: 'An unexpected error occurred, try again later'};
    }
}