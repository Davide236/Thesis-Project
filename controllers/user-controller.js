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
            On the following page: <a href="http://localhost:3000/verifyemail/${secretToken}">Email Verification</a><br/><br/>
            From the staff of Chemical Twins, we wish you a great time on our application!</p>`, 
        });
        req.flash('success', 'Account Completed, now you only need to verify your email!');
        res.redirect("/");
    } catch(e) {
        req.flash('error', e.message);
        res.redirect("/user/account");
    }
}