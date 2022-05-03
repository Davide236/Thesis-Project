//Middleware used to check if a user is logged in or not 
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You need to be logged in to access this functionality');
        return res.redirect('/');//req.headers.referer);
    }
    next();
}