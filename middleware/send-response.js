// Middleware used to process the response from a certain endpoint and
// answer correctly to it
module.exports.process_response = (req, res, response, redirect, render) => {
    response_status = Number(response.code);
    //Status is 2xx
    if (response_status >= 200 && response_status <= 300) {
        if (response.data) {
            res.status(response_status);
            res.render(render, response.data);
        } else {
            req.flash('success', response.message);
            res.redirect(redirect);
        }
    } else {
        req.flash('error',response.message);
        res.redirect(redirect);
    }
}