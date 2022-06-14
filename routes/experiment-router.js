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

//Past Experiments page
router.get('/pastexperiments', (_req, res) => {
    res.render('PastExperiments');
});

router.get('/searchexperiment', async (req, res) => {
    let response = await ExperimentController.searchExperiments(req);
    process_response(req, res, response,'/experiment/pastexperiments', "SearchExperiments");
});


router.get('/create-live', isLoggedIn, (_req, res) => {
    res.render('CreateLiveForm');
});


router.post('/create-live', isLoggedIn, async (req, res) => {
    let response = await ExperimentController.createLive(req);
    process_response(req, res, response, '/', 'LiveExperiment');
});

router.get('/leave', (req, res) => {
    ExperimentController.redirectToHomepage(req, res);
});


router.get('/delete/:room',isLoggedIn, async (req, res) => {
    await ExperimentController.deleteRoom(req, res);
});


router.post('/join-live', isLoggedIn, async (req, res) => {
    let response = await ExperimentController.joinLive(req);
    process_response(req, res, response,'/', "LiveExperiment");
});


router.get('/upload-experiment', isLoggedIn, (_req, res) => {
    res.render('UploadExperiment');
});


router.post('/upload-experiment', isLoggedIn, upload.fields([{name: 'expVideo'}, {name: 'expData'}]), async (req, res) => {
    let response = await ExperimentController.uploadExperiment(req);
    process_response(req, res, response, '/', '/');
});


router.get('/display-exp/:id', async (req, res) => {
    let response = await ExperimentController.showExperiment(req);
    process_response(req, res, response,'/experiment/pastexperiments', 'Experiment');
});



module.exports = router;