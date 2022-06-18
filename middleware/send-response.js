// Middleware used to process the response from a certain endpoint and
// answer correctly to it
module.exports.process_response = (req, res, response, redirect, render) => {
    response_status = Number(response.code);
    switch(response_status) {
        case 200:
            if (response.data) {
                res.status(response_status);
                return res.render(render, response.data)
            } else {
                req.flash('success', response.message);
                res.status(response_status);
                return res.render(redirect, {message: req.flash('success')});
                //return res.redirect(redirect);
            }
        default:
            req.flash('error',response.message);
            //return res.redirect(redirect);
            res.status(response_status);
            return res.render(redirect, {message: req.flash('error')});
    }
}