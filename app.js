const app = require('./configuration/app-config');
const socket = require('socket.io');
const PORT = 3000;

// Homepage
app.get("/", (_req, res) => {
    res.render("Homepage");
});




// Listening to localhost:3000
let server = app.listen(PORT, () => {
    console.log(`[SERVER RUNNING ON PORT ${PORT}]`);
});


//Upgraded server for webRTC connection 
let io = socket(server);

app.post("/live-data/:room", (req, res) => {
    const {room} = req.params;
    const {experiment, sensor, values} = req.body;
    res.status(200).send("OK");
    //Send the data to the room
    io.sockets.to(room).emit('data', values);
});

//Route not found
app.use((_req,res) => {
    res.status(404).send("Route not found!");
});



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
            socket.emit("created");
        //If there is already a room let user join it 
        } else {
            socket.join(roomName);
            socket.emit("joined");
        }
        //console.log(room);
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
    socket.on('offer', function(offer, roomName, userList) {
        socket.broadcast.to(roomName).emit("offer", offer, userList);
    });

    //To the offer we need to exchange an answer
    socket.on('answer', function(answer, roomName) {
        socket.broadcast.to(roomName).emit("answer", answer);
    });

    //Once a user leave we signal it to all other users
    socket.on('user-left', function(roomName, user) {
        socket.broadcast.to(roomName).emit('user-left',user);
    })

    //The creator of the rooms end the stream
    socket.on('end-stream', function(roomName) {
        socket.leave(roomName);
        //Broadcast the info the the other peers
        socket.broadcast.to(roomName).emit("end-stream");
    });

    //Creator asks a question
    socket.on('question', function(roomName, question) {
        socket.broadcast.to(roomName).emit("question", question);
    });

    //User answers the question
    socket.on('user-answer', function(roomName, answer, user) {
        socket.broadcast.to(roomName).emit("user-answer", answer,user);
    });

});
