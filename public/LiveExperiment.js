//Client side code
let socket = io.connect();

let roomName = document.getElementById("roomName").value;
let userVideo = document.getElementById("experiment-video");

//Global variable for the stream
let userStream;
//We use RTCPeerConnection to establish the connection
let rtcPeerConnection = [];
let index = -1;

let iceServers = {
    //Provide a list of STUN servers used for the connection
    iceServers: [
        {urls: "stun:stun.services.mozilla.com"},
        {urls: "stun:stun1.l.google.com:19302"},
    ],
}

//Check if the user created or joined the room
let creator = false;

//When the document is ready join the room
window.onload = function() {
    socket.emit('join', roomName);
};





function getCamera() {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
    .then(function(stream) {
        userStream = stream;
        //Success, use stream
        //Connect stream to video object
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = function(e) {
            //Start stream
            userVideo.play();
        }
    })
    .catch(function(err) {
        //Error
        alert("Got the following error" + err.name);
    })
}


//Get user media if a room is created of joined
socket.on('created', function() {
    creator = true;
    //Get the stream from the creator
    getCamera();
});

//Join the room
socket.on('joined', function() {
    creator = false;
    //Tell that the user is ready to receive the media
    socket.emit('ready', roomName);
});



//Once the client is ready we need to set up the ICE framework to let
// the users communicate
socket.on('ready', function() {
    //The creator of the room generates the offer
    if (creator) {
        index += 1;
        //We establish a connection through our Stun servers
        rtcPeerConnection[index] = new RTCPeerConnection(iceServers);
        //This is called every time we get a new ice candidate
        rtcPeerConnection[index].onicecandidate = OnIceCandidateFunction;
        //This function get triggered when we get media stream from the peer with which we're connected
        rtcPeerConnection[index].ontrack = OnTrackFunction;
        //Send media information to the peer. This function takes 0 for audio and 1 for video
        //Sending audio
        rtcPeerConnection[index].addTrack(userStream.getTracks()[0], userStream);
        //Sending video
        rtcPeerConnection[index].addTrack(userStream.getTracks()[1], userStream);
        //Create an offer which takes a success callback function and an error one
        rtcPeerConnection[index].createOffer()
        .then(function(offer) {
            rtcPeerConnection[index].setLocalDescription(offer);
            socket.emit('offer', offer, roomName);
        })
        .catch(function(err) {
            console.log(err);
        });
    }
});

//Exchange of public address information between ICE candidates
socket.on('candidate', function(candidate) {
    if (creator) {
        var icecandidate = new RTCIceCandidate(candidate);
        rtcPeerConnection[index].addIceCandidate(icecandidate);
    }
});

socket.on('offer', function(offer) {
    //The person joining the room (receiving the offer) has to go through the same steps as the creator
    if (!creator && !rtcPeerConnection[0]) {
        rtcPeerConnection[0] = new RTCPeerConnection(iceServers);
        rtcPeerConnection[0].onicecandidate = OnIceCandidateFunction;
        rtcPeerConnection[0].ontrack = OnTrackFunction;
        //Set offer as remote description
        rtcPeerConnection[0].setRemoteDescription(offer);
        //The one joining doesn't create an offer but instead creates an answer
        rtcPeerConnection[0].createAnswer()
        .then(function(answer) {
            rtcPeerConnection[0].setLocalDescription(answer)
            socket.emit('answer', answer, roomName);
        })
        .catch(function(err) {
            console.log(err);
        });
    }
});

socket.on('answer', function(answer) {
    if (creator) {
        //Set the answer as remote description
        rtcPeerConnection[index].setRemoteDescription(answer);
    }
});


//Here we have to perform the handshake (exchange ice candidates)
function OnIceCandidateFunction(event) {
    if (event.candidate) {
        //We send the candidate and the roomname
        socket.emit('candidate',event.candidate,roomName);
    }
}

//We get the stream from our peer and display it
function OnTrackFunction(event) {
    //Since there is only 1 stream we use index 0
    if (!creator) {
        userVideo.srcObject = event.streams[0];
        userVideo.onloadeddata = function(e) {
            userVideo.play();
        }
    }
}