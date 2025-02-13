const app = require('./configuration/app-config');
const socket = require('socket.io');
const PORT = process.env.PORT || 3000;

//Homepage
app.get("/", (_req, res) => {
    res.render("Homepage");
});


//How it works page
app.get("/how-it-works", (_req, res) => {
    res.render("HowItWorks");
});

// Route to get the survey page
app.get("/survey", (_req, res) => {
    // Render the questions from a Json file
    let questions_list = require('./public/survey/survey_questions.json');
    let questions = questions_list['questions'];
    res.render("survey/Survey", {questions});
});

// Listening to the Heroku port
let server = app.listen(PORT, () => {
    console.log(`[SERVER RUNNING ON PORT ${PORT}]`);
});


//Upgraded server for webRTC connection 
let io = socket(server);


// Post request to send data (from the script) to the application
// this post request gets the data from the sensors and sends it
// to the stream
app.post("/live-data/:room", (req, res) => {
    const {room} = req.params;
    const {value} = req.body;
    res.status(200).send("Data Received");
    //Send the data to the room
    io.sockets.to(room).emit('data', value);
});


//Route not found
app.use((_req,res) => {
    res.status(404).send("Route not found!");
});


//Setup of socket.io
io.on('connection', function(socket) {
    
    //Get room name from client
    socket.on('join', function(roomName) {
        //Find all the rooms
        var rooms = io.sockets.adapter.rooms;
        //Check if there is a room named 'roomName' variable
        var room = rooms.get(roomName);
        //If there is no room name we need to create a room
        if (room == undefined) {
            //Create room
            socket.join(roomName);
            //Create a list of STUN/TURN servers to be used during the connection
            const accountSid = process.env.TWILIO_SID;
            const authToken = process.env.TWILIO_TOKEN;
            const client = require('twilio')(accountSid, authToken);
            let server;
            client.tokens.create().then(token => {
                server = JSON.parse(JSON.stringify(token.iceServers));
            })
            .then(()=>{
                socket.emit("created", server);
            })
            .catch((error) => {
                console.log(error);
            });
        //If there is already a room let user join it 
        } else {
            socket.join(roomName);
            socket.emit("joined");
        }
    });

    socket.on('ready', function(roomName, username) {
        //Broadcast message to a room
        socket.broadcast.to(roomName).emit("ready", username);
    });

    //Exchange ICE candidate between users
    socket.on('candidate', function(candidate, roomName) {
        socket.broadcast.to(roomName).emit("candidate", candidate);
    });

    //We also need to exchange Offers in SDP. To the offer we need to exchange an answer
    socket.on('offer', function(offer, roomName, userList, iceServers) {
        socket.broadcast.to(roomName).emit("offer", offer, userList, iceServers);
    });

    //To the offer we need to exchange an answer
    socket.on('answer', function(answer, roomName) {
        socket.broadcast.to(roomName).emit("answer", answer);
    });

    //Once a user leave we signal it to all other users
    socket.on('user-left', function(roomName, user) {
        socket.broadcast.to(roomName).emit('user-left',user);
    });

    //The creator of the rooms end the stream
    socket.on('end-stream', function(roomName) {
        socket.leave(roomName);
        //Broadcast the info the the other peers
        socket.broadcast.to(roomName).emit("end-stream");
    });

    //Creator asks a question
    socket.on('question', function(roomName, question, answerPoll) {
        socket.broadcast.to(roomName).emit("question", question, answerPoll);
    });

    //User answers the question
    socket.on('user-answer', function(roomName, answer, user) {
        socket.broadcast.to(roomName).emit("user-answer", answer,user);
    });

    //End the simulations
    socket.on('stop_simulation', function(roomName) {
        socket.broadcast.to(roomName).emit('stop_simulation');
    });

});
