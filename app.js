//Get all the different modules and the setups needed
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true })); // Body parser setup

app.set('view engine', 'ejs'); //use ejs as template
app.set('views', path.join(__dirname, 'views')); //set views directory
app.use(express.static(__dirname + '/public/')); //set public directory

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




const experiments = [
    {
        title: 'Experiment 1',
        video: 'Video preview',
        description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis fugit quia ipsam modi voluptates eligendi atque odit suscipit, iure optio itaque aperiam necessitatibus nulla doloribus! Sit ea exercitationem neque qui?',
        date: 1,
        length: 15
    },
    {
        title: 'Experiment 2',
        video: 'Video preview',
        description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis fugit quia ipsam modi voluptates eligendi atque odit suscipit, iure optio itaque aperiam necessitatibus nulla doloribus! Sit ea exercitationem neque qui?',
        date: 2,
        length: 14
    },
    {
        title: 'Experiment 3',
        video: 'Video preview',
        description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis fugit quia ipsam modi voluptates eligendi atque odit suscipit, iure optio itaque aperiam necessitatibus nulla doloribus! Sit ea exercitationem neque qui?',
        date: 3,
        length: 13
    },
    {
        title: 'Experiment 4',
        video: 'Video preview',
        description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis fugit quia ipsam modi voluptates eligendi atque odit suscipit, iure optio itaque aperiam necessitatibus nulla doloribus! Sit ea exercitationem neque qui?',
        date: 2,
        length: 12
    },
]

app.get("/experiments", (_req, res) => {
    res.send(experiments);
});


//Route not found
app.use((_req,res) => {
    res.status(404).send("Route not found!");
});

// Listening to localhost:3000
app.listen(PORT, () => {
    console.log(`[SERVER RUNNING ON PORT ${PORT}]`);
});