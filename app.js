const app = require('./configuration/app-config');
const PORT = 3000;


// Homepage
app.get("/", (_req, res) => {
    res.render("Homepage");
});

//Past Experiments page
app.get("/pastexperiments", (_req, res) => {
    res.render("PastExperiments");
});

app.get("/searchexperiment", (req, res) => {
    const {searchQuery} = req.query;
    var response = experiments.filter(element => element.title.includes(searchQuery));
    res.render("SearchExperiments", {response, searchQuery});
});


//Route not found
app.use((_req,res) => {
    res.status(404).send("Route not found!");
});

// Listening to localhost:3000
app.listen(PORT, () => {
    console.log(`[SERVER RUNNING ON PORT ${PORT}]`);
});