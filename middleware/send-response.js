module.exports.process_response = (req, res, response, redirect, render) => {
    switch(response.code) {
        case '200':
            if (response.data) {
                return res.render(render, response.data)
            } else {
                req.flash('success', response.message);
                return res.redirect(redirect);
            }
        default:
            req.flash('error',response.message);
            res.redirect(redirect);
    }
}