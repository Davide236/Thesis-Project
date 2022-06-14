const mod = require('../configuration/router-config');
const new_router = mod.newRouter();
const router = new_router[0];
const passport = new_router[1];
const UserController = require('../controllers/user-controller');
const { isLoggedIn } = require('../middleware/user-login');
const {process_response} = require('../middleware/send-response');

router.get('/account', (_req, res) => {
    res.render("Account");
});

router.get('/editaccount', isLoggedIn, (_req, res) =>{
    res.render('EditAccount');
});

router.post("/deleteaccount", isLoggedIn, async (req, res) => {
    let response = await UserController.userDelete(req);
    process_response(req,res,response, '/', '/');
});

router.post('/editaccount', isLoggedIn, async(req, res) => {
    let response = await UserController.editAccount(req);
    process_response(req,res,response, '/', '/');
});

router.get('/verifyemail/:secretToken', async(req, res) => {
    let response = await UserController.verifyEmail(req);
    process_response(req,res,response, '/', '/');
});

router.post('/passwordreset', async(req, res) =>{
    let response = await UserController.resetPassword(req);
    process_response(req,res,response, '/', '/');
});

router.get('/newpassword/:secretToken', (req, res) => {
    const {secretToken} = req.params;
    res.render('NewPassword', {secretToken});
});

router.post('/newpassword/:secretToken', async(req, res) => {
    let response = await UserController.setNewPassword(req);
    process_response(req,res,response, '/', '/');
});

router.post('/signup', async (req, res) => {
   let response = await UserController.userSignup(req);
   process_response(req,res,response, '/', '/');
});


router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/user/account'}), async (req,res) => {
    let response = UserController.userLogin(req);
    process_response(req,res,response, '/', '/');
});

router.get('/logout', isLoggedIn, (req, res) => {
    let response = UserController.userLogout(req);
    process_response(req,res,response, '/', '/');
});


module.exports = router;