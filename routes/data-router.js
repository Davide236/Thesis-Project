// Require express and connect it to the router
const express = require('express');
const router = express.Router();
const DataController = require('../controllers/data-controller');

let bodyParser = require('body-parser');
router.use(bodyParser.json());


router.get("/experiments", async (_req, res) => {
    await DataController.sendExperiments(res);
});


router.post('/add-answers/:room', async(req, res) => {
    await DataController.addStudentAnswers(req, res);
});


router.get("/live-data/:room", async (req, res) => {
    await DataController.getUserAnswers(req, res);
});


router.get('/get-data/:id', async (req, res) => {
    await DataController.getExperimentData(req, res);
});



module.exports = router;