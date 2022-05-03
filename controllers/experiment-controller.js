exports.searchExperiments = function(req, res) {
    const {searchQuery} = req.query;
    let response = experiments.filter(element => element.title.includes(searchQuery));
    res.render("SearchExperiments", {response, searchQuery});
}


exports.getLiveForm = function(res) {
    let url = Math.random().toString(36).substring(1,10)
    res.render("CreateLiveForm", {url});
}

exports.createLive = function(req, res) {
    const {expName, expDescription, sensors, roomPassword, url} = req.body;
    res.render("LiveExperiment", {expName, expDescription, sensors, roomPassword, url});
}


exports.joinLive = function(req, res) {
    //TODO
    //Check if LIVE already exist through
    const {roomPassword} = req.body;
    res.render("LiveExperiment", {roomPassword});
}