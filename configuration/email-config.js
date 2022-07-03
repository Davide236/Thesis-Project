//File used for the configuration of nodemailer, API used for email verifications

require('dotenv').config();
const nodemailer = require('nodemailer');


const transport = nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    }
});


module.exports = transport;
