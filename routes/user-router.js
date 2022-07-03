const mod = require('../configuration/router-config');
const new_router = mod.newRouter();
const router = new_router[0];
const passport = new_router[1];
const UserController = require('../controllers/user-controller');
const { isLoggedIn } = require('../middleware/user-login');
const {process_response} = require('../middleware/send-response');

// Route used to render the account page
router.get('/account', (_req, res) => {
    res.render("Account");
});

// Route used to render the edit account page
router.get('/editaccount', isLoggedIn, (_req, res) =>{
    res.status(200);
    res.render('EditAccount');
});


// Route which is used if the user wants to delete their account
router.post("/deleteaccount", isLoggedIn, async (req, res) => {
    let response = await UserController.userDelete(req);
    process_response(req,res,response, '/', '/');
});


// Route which is used if the user wants to edit their account
router.post('/editaccount', isLoggedIn, async(req, res) => {
    let response = await UserController.editAccount(req);
    process_response(req,res,response, '/', '/');
});


// Route which is accessed by the user through a link sent along with the email
// verification and is used to verify the user account
router.get('/verifyemail/:secretToken', async(req, res) => {
    let response = await UserController.verifyEmail(req);
    process_response(req,res,response, '/', '/');
});


// Route used by the users to change password by sending a email to their account
router.post('/passwordreset', async(req, res) =>{
    let response = await UserController.resetPassword(req);
    process_response(req,res,response, '/', '/');
});

// Route which renders the page to set a new password
router.get('/newpassword/:secretToken', (req, res) => {
    const {secretToken} = req.params;
    res.status(200);
    res.render('NewPassword', {secretToken});
});

// Route which allows users to change their password
router.post('/newpassword/:secretToken', async(req, res) => {
    let response = await UserController.setNewPassword(req);
    process_response(req,res,response, '/', '/');
});


// Route which allows users to signup to the website
router.post('/signup', async (req, res) => {
   let response = await UserController.userSignup(req);
   process_response(req,res,response, '/', '/');
});

// Route which allows users to login the website. It uses passport local for authentication
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/user/account'}), async (req,res) => {
    let response = UserController.userLogin(req);
    process_response(req,res,response, '/', '/');
});

// Route used by the user to logout from their account
router.get('/logout', isLoggedIn, (req, res) => {
    let response = UserController.userLogout(req);
    process_response(req,res,response, '/', '/');
});


module.exports = router;