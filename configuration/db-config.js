require('dotenv').config();

const mongoose = require('mongoose'),
    database = mongoose.connection,
    DB_USER = process.env.DB_USER,
    DB_PASSWORD = process.env.DB_PASSWORD,
    DB_HOST = process.env.DB_HOST,
    DB_NAME = process.env.DB_NAME,
    dbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

exports.setupDatabase = function() {
    mongoose.connect(dbUrl);
    // Connect to the DataBase
    database.on("error", console.error.bind(console, "Connection error to Database:"));
    database.once("open", () => {
        console.log("Database connected!");
    });
}

