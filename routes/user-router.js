var mod = require('../configuration/user-router-config');
const router = mod.router;
const passport = mod.passport;
const UserController = require('../controllers/user-controller');


router.get("/account", (_req, res) => {
    res.render("Account");
});

router.post("/signup", async (req, res) => {
   await UserController.userSignup(req, res);
});


router.post("/login", passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), async (req,res) => {
    UserController.userLogin(req, res);
});


module.exports = router;