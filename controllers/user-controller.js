const User = require('../models/User');
const transport = require('../configuration/email-config');
const { v4: uuidV4 } = require('uuid');

//Function which logs in a user
exports.userLogin = function(req, res) {
    //Check if the users' account has already been verified
    if (req.user.verification.verified == false) {
        req.flash('error', 'You need to verify your email first to access your account');
        req.logout();
        return res.redirect("/user/account");
    }
    req.flash('success', 'You logged in successfully!');
    res.redirect("/");
}


//Function which takes care of the signing up for the user
exports.userSignup = async function (req, res) {
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
            from: process.env.EMAIL, to: newUser.username, subject: 'Chemical Twins email verification',
            html: `
            <h1>Register on Chemical Twins</h1>
            <p>Hello ${newUser.fullName}, thank you for your registration on our website. <br/><br/>
            The last step in the registration process is to verify your email by clicking on the following link: <br/>
            On the following page: <a href="https://chemical-twins.herokuapp.com/user/verifyemail/${secretToken}">Email Verification</a><br/><br/>
            From the staff of Chemical Twins, we wish you a great time on our application!</p>`, 
        });
        req.flash('success', 'Account Completed, now you only need to verify your email!');
        res.redirect("/");
    } catch(e) {
        req.flash('error', e.message);
        res.redirect("/user/account");
    }
}

//Function for user logout
exports.userLogout = function(req, res) {
    req.logout();
    req.flash('success', 'You logged out your account');
    res.redirect("/");
}

//Function that implements the email verification for the users
exports.verifyEmail = async function(req, res) {
    const {secretToken} = req.params;
    const user = await User.findOne({'verification.secretToken': secretToken});
    //Check if the user exists
    if (!user) {
        req.flash('error', 'Wrong url, contact the team to get help with your verification');
        return res.redirect("/");
    }
    try {
        //Change the users' status to verified
        user.verification.verified = true;
        user.verification.secretToken = '';
        await user.save();
        req.flash('success', 'Email verified correctly!');
        res.redirect("/");
    } catch(err) {
        res.status(400).send('Error in verifying you account');
    }
}


//Function which edits an account of a user
exports.editAccount = async function(req, res) {
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
        req.flash('success', 'Changes Applied Correctly');
        res.redirect('/');
    } catch (err) {
        res.status(400).send('Error in saving the changes to your account');
    }
}

//Function which deletes the account of a user given its' ID
exports.userDelete = async function(req, res) {
    try {
        const userID = req.user.id;
        req.logout();
        await User.deleteOne({_id: userID});
        req.flash('success', 'Account deleted successfully');
        res.redirect("/");
    } catch (err) {
        res.status(400).send('Couldnt delete your account, try again');
    }
}

//Function which sets a new password for a user
exports.setNewPassword = async function(req, res) {
    const {secretToken} = req.params;
    const {password} = req.body;
    //Find the user corresponding to the token
    const user = await User.findOne({'verification.passwordReset': secretToken});
    if (!user) {
        req.flash('error', 'Error in finding your accound, try again');
        return res.redirect("/");
    }
    try {
        user.verification.passwordReset = '';
        await user.setPassword(password);
        await user.save();
        req.flash("success", "Password changed correctly! Try to login to your account again");
        res.redirect("/");
    } catch(err) {
        res.status(400).send('There was an error in changing your password, try again');
    }
}


//Function which sends an email to user to reset their password
exports.resetPassword = async function(req, res) {
    const {username} = req.body;
    const user = await User.findOne({username});
    const secretToken = uuidV4();
    if (!user) {
        req.flash('error', 'An account with this email doesnt exist');
        return res.redirect("/user/account");
    }
    user.verification.passwordReset = secretToken;
    try {
        await user.save();
        //Send email to user to reset their password
        await transport.sendMail({
            from: process.env.EMAIL, to: username, subject: 'Chemical twins new password',
            html: `
            <h1>Reset your Chemical Twins password </h1>
            Hello ${user.fullName},
            To reset your password for the website <br> Chemical Twins click on the following link: <a href="https://chemical-twins.herokuapp.com/user/newpassword/${secretToken}">New password</a>
            <br>`, 
        });
        req.flash('success', 'An email was sent to your account to get a new password');
        res.redirect("/");
    } catch(err) {
        res.status(400).send('An unexpected error occurred, try again later');
    }
}