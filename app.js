//Get all the different modules and the setups needed
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const dataRoutes = require('./routes/data-router');
app.use(express.urlencoded({ extended: true })); // Body parser setup

app.set('view engine', 'ejs'); //use ejs as template
app.set('views', path.join(__dirname, 'views')); //set views directory
app.use(express.static(__dirname + '/public/')); //set public directory
app.use("/data", dataRoutes);

// Homepage
app.get("/", (_req, res) => {
    res.render("Homepage");
});

//Past Experiments page
app.get("/pastexperiments", (_req, res) => {
    res.render("PastExperiments");
});

app.get("/searchexperiment", (req, res) => {
    const {searchQuery} = req.query;
    var response = experiments.filter(element => element.title.includes(searchQuery));
    res.render("SearchExperiments", {response, searchQuery});
});





//Route not found
app.use((_req,res) => {
    res.status(404).send("Route not found!");
});

// Listening to localhost:3000
app.listen(PORT, () => {
    console.log(`[SERVER RUNNING ON PORT ${PORT}]`);
});