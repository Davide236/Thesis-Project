// Require express and connect it to the router
const mod = require('../configuration/router-config');
const router = mod.router;

const multer = require("multer");
var storage = multer.diskStorage({});
const upload = multer({storage: storage});

const ExperimentController = require('../controllers/experiment-controller');

const { isLoggedIn } = require('../middleware/user-login');

//Past Experiments page
router.get('/pastexperiments', (_req, res) => {
    res.render('PastExperiments');
});

router.get('/searchexperiment', async (req, res) => {
    await ExperimentController.searchExperiments(req, res);
});


router.get('/create-live', isLoggedIn, (_req, res) => {
    ExperimentController.getLiveForm(res);
});


router.post('/create-live', isLoggedIn, async (req, res) => {
    await ExperimentController.createLive(req, res);
});

router.get('/leave', (req, res) => {
    ExperimentController.redirectToHomepage(req, res);
});


router.get('/delete/:room',isLoggedIn, async (req, res) => {
    await ExperimentController.deleteRoom(req, res);
});


router.post('/join-live', isLoggedIn, async (req, res) => {
    await ExperimentController.joinLive(req, res);
});


router.get('/upload-experiment', isLoggedIn, (_req, res) => {
    res.render('UploadExperiment');
});


router.post('/upload-experiment', isLoggedIn, upload.fields([{name: 'expVideo'}, {name: 'expData'}]), async (req, res) => {
    await ExperimentController.uploadExperiment(req, res);
});



module.exports = router;