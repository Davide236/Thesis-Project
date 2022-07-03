// Require express and connect it to the router
const mod = require('../configuration/router-config');
const new_router = mod.newRouter();
const router = new_router[0];

//Setup of Multer, used to save temporarily the files (.mp4/.json) uploaded by the user
const multer = require("multer");
var storage = multer.diskStorage({});
const upload = multer({storage: storage});

const ExperimentController = require('../controllers/experiment-controller');

const { isLoggedIn } = require('../middleware/user-login');
const {process_response} = require('../middleware/send-response');

// Past Experiments page
router.get('/pastexperiments', (_req, res) => {
    res.status(200);
    res.render('PastExperiments');
});

// Route which search for an experiment given a query
router.get('/searchexperiment', async (req, res) => {
    let response = await ExperimentController.searchExperiments(req);
    process_response(req, res, response,'/experiment/pastexperiments', "SearchExperiments");
});


// Route which renders the create live form
router.get('/create-live', isLoggedIn, (_req, res) => {
    res.status(200);
    res.render('CreateLiveForm');
});


// Route used to create a stream
router.post('/create-live', isLoggedIn, async (req, res) => {
    let response = await ExperimentController.createLive(req);
    process_response(req, res, response, '/', 'LiveExperiment');
});

// Route used when a user leaves the stream
router.get('/leave', (req, res) => {
    ExperimentController.redirectToHomepage(req, res);
});

// Route used to delete a stream from the database
router.get('/delete/:room',isLoggedIn, async (req, res) => {
    await ExperimentController.deleteRoom(req, res);
});

// Route used by users to join an already existing stream
router.post('/join-live', isLoggedIn, async (req, res) => {
    let response = await ExperimentController.joinLive(req);
    process_response(req, res, response,'/', "LiveExperiment");
});


// Route which renders a page to upload experiments
router.get('/upload-experiment', isLoggedIn, (_req, res) => {
    res.status(200);
    res.render('UploadExperiment');
});

// Route used to upload an experiment. Multer is used to upload the video and data file
router.post('/upload-experiment', isLoggedIn, upload.fields([{name: 'expVideo'}, {name: 'expData'}]), async (req, res) => {
    let response = await ExperimentController.uploadExperiment(req);
    process_response(req, res, response, '/', '/');
});

// Route used to display an experiment
router.get('/display-exp/:id', async (req, res) => {
    let response = await ExperimentController.showExperiment(req);
    process_response(req, res, response,'/experiment/pastexperiments', 'Experiment');
});



module.exports = router;