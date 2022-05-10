// Require express and connect it to the router
const express = require('express');
const router = express.Router();
const DataController = require('../controllers/data-controller');

let bodyParser = require('body-parser');
router.use(bodyParser.json());


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


router.post('/add-answers/:room', async(req, res) => {
    await DataController.addStudentAnswers(req, res);
});


router.get("/live-data/:room", async (req, res) => {
    await DataController.getUserAnswers(req, res);
});




module.exports = router;