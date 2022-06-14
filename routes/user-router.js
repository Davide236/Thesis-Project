const mod = require('../configuration/router-config');
const new_router = mod.newRouter();
const router = new_router[0];
const passport = new_router[1];
const UserController = require('../controllers/user-controller');
const { isLoggedIn } = require('../middleware/user-login');


router.get('/account', (_req, res) => {
    res.render("Account");
});

router.get('/editaccount', isLoggedIn, (_req, res) =>{
    res.render('EditAccount');
});

router.post("/deleteaccount", isLoggedIn, async (req, res) => {
    await UserController.userDelete(req, res);
});

router.post('/editaccount', isLoggedIn, async(req, res) => {
    await UserController.editAccount(req, res);
});

router.get('/verifyemail/:secretToken', async(req, res) => {
    await UserController.verifyEmail(req, res);
});

router.post('/passwordreset', async(req, res) =>{
    await UserController.resetPassword(req, res);
});

router.get('/newpassword/:secretToken', (req, res) => {
    const {secretToken} = req.params;
    res.render('NewPassword', {secretToken});
});

router.post('/newpassword/:secretToken', async(req, res) => {
    await UserController.setNewPassword(req, res);
});

router.post('/signup', async (req, res) => {
   await UserController.userSignup(req, res);
});


router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/user/account'}), async (req,res) => {
    UserController.userLogin(req, res);
});

router.get('/logout', isLoggedIn, (req, res) => {
    UserController.userLogout(req, res);
});


module.exports = router;