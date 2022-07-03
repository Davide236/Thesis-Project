// Require express and connect it to the router
const express = require('express');
const router = express.Router();
const DataController = require('../controllers/data-controller');

let bodyParser = require('body-parser');
router.use(bodyParser.json());


// Route used to get a list of past experiment
router.get("/experiments", async (_req, res) => {
    await DataController.sendExperiments(res);
});


router.post("/submit-survey", async (req, res) => {
    await DataController.saveSurvey(req, res);
});


// Route used to save the answers of student during a live
router.post('/add-answers/:room', async(req, res) => {
    await DataController.addStudentAnswers(req, res);
});


// Route used to retrieve the answers from students
router.get("/live-data/:room", async (req, res) => {
    await DataController.getUserAnswers(req, res);
});


// Route used to retrieve the data of an experiment
router.get('/get-data/:id', async (req, res) => {
    await DataController.getExperimentData(req, res);
});



module.exports = router;