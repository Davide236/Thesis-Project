// Middleware used to process the response from a certain endpoint and
// answer correctly to it
module.exports.process_response = (req, res, response, redirect, render) => {
    switch(response.code) {
        case '200':
            if (response.data) {
                return res.status(200).render(render, response.data)
            } else {
                req.flash('success', response.message);
                return res.status(200).redirect(redirect);
            }
        default:
            req.flash('error',response.message);
            stat = Number(response.code);
            return res.status(stat).redirect(redirect);
    }
}