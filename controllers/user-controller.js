const User = require('../models/User');
const transport = require('../configuration/email-config');


exports.userLogin = function(req, res) {
    if (req.user.verification.verified == false) {
        req.flash('error', 'You need to verify your email first to access your account');
        req.logout();
        return res.redirect("/user/account");
    }
    req.flash('success', 'You logged in successfully!');
    res.redirect("/");
}


exports.userSignup = async function (req, res) {
    const {fullName, username, password} = req.body;
    const user = new User({fullName, username});
    try {
        const newUser = await User.register(user, password);
        const secretToken = Math.random().toString(36).substring(1,13);
        newUser.verification.secretToken = secretToken;
        await newUser.save();
        await transport.sendMail({
            from: process.env.EMAIL, to: newUser.username, subject: 'AllReviews email verification',
            html: `
            <h1>Register on Chemical Twins</h1>
            <p>Hello ${newUser.fullName}, thank you for your registration on our website. <br/><br/>
            The last step in the registration process is to verify your email by clicking on the following link: <br/>
            On the following page: <a href="http://localhost:3000/user/verifyemail/${secretToken}">Email Verification</a><br/><br/>
            From the staff of Chemical Twins, we wish you a great time on our application!</p>`, 
        });
        req.flash('success', 'Account Completed, now you only need to verify your email!');
        res.redirect("/");
    } catch(e) {
        req.flash('error', e.message);
        res.redirect("/user/account");
    }
}


exports.userLogout = function(req, res) {
    req.flash('success', 'You logged out your account');
    req.logout();
    res.redirect("/");
}


exports.verifyEmail = async function(req, res) {
    const {secretToken} = req.params;
    const user = await User.findOne({'verification.secretToken': secretToken});
    if (!user) {
        req.flash('error', 'Wrong url, contact the team to get help with your verification');
        return res.redirect("/");
    }
    user.verification.verified = true;
    user.verification.secretToken = '';
    await user.save();
    req.flash('success', 'Email verified correctly!');
    res.redirect("/");
}

exports.editAccount = async function(req, res) {
    const {fullName, password} = req.body;
    const user = await User.findById(req.user.id);
    if (fullName) {
        user.fullName = fullName
    }
    if (password) {
        await user.setPassword(password);
    }
    await user.save();
    req.flash('success', 'Changes Applied Correctly');
    res.redirect('/');
}

exports.userDelete = async function(req, res) {
    const userID = req.user.id;
    req.logout();
    await User.deleteOne({_id: userID});
    req.flash('success', 'Account deleted successfully');
    res.redirect("/");
}


exports.setNewPassword = async function(req, res) {
    const {secretToken} = req.params;
    const {password} = req.body;
    const user = await User.findOne({'verification.passwordReset': secretToken});
    if (!user) {
        req.flash('error', 'Error in finding your accound, try again');
        return res.redirect("/");
    }
    user.verification.passwordReset = '';
    await user.setPassword(password);
    await user.save();
    req.flash("success", "Password changed correctly! Try to login to your account again");
    res.redirect("/");
}


exports.resetPassword = async function(req, res) {
    const {username} = req.body;
    const user = await User.findOne({username});
    const secretToken = Math.random().toString(36).substring(1,13);
    if (!user) {
        req.flash('error', 'An account with this email doesnt exist');
        return res.redirect("/user/account");
    }
    user.verification.passwordReset = secretToken;
    await user.save();
    await transport.sendMail({
        from: process.env.EMAIL, to: username, subject: 'Chemical twins new password',
        html: `
        <h1>Reset your Chemical Twins password </h1>
        Hello ${user.fullName},
        To reset your password for the website <br> Chemical Twins click on the following link: <a href="http://localhost:3000/user/newpassword/${secretToken}">New password</a>
        <br>`, 
    });
    req.flash('success', 'An email was sent to your account to get a new password');
    res.redirect("/");
}