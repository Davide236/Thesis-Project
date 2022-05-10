// Require express and connect it to the router
const express = require('express');
const router = express.Router();

let bodyParser = require('body-parser');
router.use(bodyParser.json());



const rooms = ['room1']

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

router.get("/experiments", (_req, res) => {
    res.send(experiments);
});


//Trigger this not too often
router.get("/live-data/:room", async (req, res) => {
    const {room} = req.params;
    //GET THE EXPERIMENT DATA from DB
    console.log("SENDING DATA");
    if (rooms.includes(room)) {
        res.status(200).send(experiments);
    } else {
        res.status(404).send("Link not found");
    }
});


router.post("/live-data/:room", (req, res) => {
    console.log("HERE");
    const {room} = req.params;
    const {experiment, sensor, values} = req.body;
    //Send the data to the room
    console.log(room, values);
    res.status(200).send("OK");
});




module.exports = router;