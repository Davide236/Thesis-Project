// Require express and connect it to the router
const mod = require('../configuration/router-config');
const router = mod.router;
const ExperimentController = require('../controllers/experiment-controller');


const { isLoggedIn } = require('../middleware/user-login');

//Past Experiments page
router.get("/pastexperiments", (_req, res) => {
    res.render("PastExperiments");
});

router.get("/searchexperiment", (req, res) => {
    ExperimentController.searchExperiments(req, res);
});


router.get('/create-live', isLoggedIn, (_req, res) => {
    ExperimentController.getLiveForm(res);
});


router.post('/create-live', isLoggedIn, (req, res) => {
    ExperimentController.createLive(req, res);
});


router.post('/join-live',  isLoggedIn, (req, res) => {
    ExperimentController.joinLive(req, res);
});



module.exports = router;