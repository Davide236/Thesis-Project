//Client side code
let socket = io.connect();

let roomName = document.getElementById("roomName").innerHTML;
let user = document.getElementById("username").innerHTML;

let userVideo = document.getElementById("experiment-video");

let muteBtn = document.getElementById("muteBtn");
let hideCameraBtn = document.getElementById("hideCameraBtn");
let endStreamBtn = document.getElementById("endStreamBtn");
let leaveRoomBtn = document.getElementById("leaveRoomBtn");
let askQuestionBtn = document.getElementById("askQuestionBtn");
let showAnswerBtn = document.getElementById("showAnswerBtn");


let questionForm = document.getElementById('questionForm');
let sidebar = document.querySelector('.sidebar');
let sidebarContent = document.querySelector('.sidebar-content');
let experimentData = document.getElementById('experimentData');
let studentAnswers = document.getElementById('studentAnswers');


document.getElementById("sidebarButton").addEventListener('click', toggleSidebar);

//Flag to see if the audio was muted
let muted = false;

//Flag to see if camera is hidden
let hidden = false;

//List of all the users connected to the stream
let userList = [];

//List of all answers from the questions asked to the students
let answerList = [];


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
    userList.push(user);
    updateUserList();
    socket.emit('join', roomName);
};


function muteStream() {
    muted = !muted;
    if (muted) {
        userStream.getTracks()[0].enabled = false;
        muteBtn.textContent = "Unmute";
    } else {
        userStream.getTracks()[0].enabled = true;
        muteBtn.textContent = "Mute";
    } 
}


function toggleSidebar() {
    questionForm.classList.toggle('material-hidden');
    experimentData.classList.toggle('material-hidden');
    studentAnswers.classList.toggle('material-hidden');

    sidebar.classList.toggle('sidebar-shown');
    sidebarContent.classList.toggle('sidebar-content-shown');
}

function hideStream() {
    hidden = !hidden;
    if (hidden) {
        userStream.getTracks()[1].enabled = false;
        hideCameraBtn.textContent = "Show Camera";
    } else {
        userStream.getTracks()[1].enabled = true;
        hideCameraBtn.textContent = "Hide Camera";
    }
}


function endStream() {
    
    //Ask the user if they're sure they want to end the stream
    if (!confirm("Are you sure you want to end the stream?")) {
        return;
    }

    socket.emit('end-stream', roomName);

    //Stop audio and video
    if (userVideo.srcObject) { //Check if there is the video
        userVideo.srcObject.getTracks()[0].stop();
        userVideo.srcObject.getTracks()[1].stop();  
    }

    //Close all connections to the creator
    for (i = 0; i<index; i++) {
        rtcPeerConnection[i].ontrack = null;
        rtcPeerConnection[i].onicecandidate = null;
        rtcPeerConnection[i].close();
        rtcPeerConnection[i] = null;
    }
    //Redirect to homepage
    window.location.replace(`/experiment/delete/${roomName}`);
}



socket.on('data', function(values) {
    console.log(values);
});



function leaveStream(flag) {
    //If the flag is null it means that the user wants to leave
    if (flag != true) {
        //Ask the user if they're sure they want to leave the stream
        if (!confirm("Are you sure you want to leave the stream?")) {
            return;
        }
        socket.emit('user-left', roomName, user);
    } 
    
    //Close the rtcpeer connection
    if (rtcPeerConnection[0]) {
        rtcPeerConnection[0].ontrack = null;
        rtcPeerConnection[0].onicecandidate = null;
        rtcPeerConnection[0].close();
        rtcPeerConnection[0] = null;
    }

    //Stop the peer video
    if (userVideo.srcObject) { //Check if there is the video
        userVideo.srcObject.getTracks()[0].stop();
        userVideo.srcObject.getTracks()[1].stop();  
    }

    //Redirect to homepage
    window.location.replace('/experiment/leave');

}


function showQuestion() {
    questionForm.style.display = "block";
}


function closeQuestionForm() {
    questionForm.style.display = "none";
}



function askQuestion() {
    let question = document.getElementById('question').value;
    socket.emit('question', roomName, question);
    closeQuestionForm();
}


function answerQuestion() {
    let answer = document.getElementById('answer').value;
    socket.emit('user-answer', roomName, answer, user);
    closeQuestionForm();
}


function closeAnswerForm() {
    studentAnswers.style.display = 'none';
}

function showAnswer() {
    studentAnswers.style.display = 'block';
    $('#answerList').html('');
    answerListHTML = '';
    for (answer of answerList) {
        answerListHTML += `
            <div class="row">
                <div class="col-4">${answer.username}</div>
                <div class="col-8">${answer.answer}</div>
            </div>
        `;
    }
    $('#answerList').append(answerListHTML);
}

socket.on('user-answer', function(answer, username) {
    if (creator) {
        //Send this to the script
        answerList.push({username, answer});
    }
});


socket.on('question', function(question) {
    if (!creator) {
        $('#questionAsked').html('');
        $('#questionAsked').append(question);
        showQuestion();
    }
});

socket.on('user-left', function(user) {
    let idx = userList.indexOf(user);
    userList.splice(idx,1);
    updateUserList();
});



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
    });
}


//Get user media if a room is created of joined
socket.on('created', function() {
    creator = true;
    //Add event listeners for the creators' buttons
    hideCameraBtn.addEventListener('click', hideStream);
    muteBtn.addEventListener('click', muteStream);
    endStreamBtn.addEventListener('click', endStream);
    askQuestionBtn.addEventListener('click', showQuestion);
    showAnswerBtn.addEventListener('click', showAnswer);
    //Get the stream from the creator
    getCamera();
    //mute video of creator
    userVideo.muted = true;
});

//Join the room
socket.on('joined', function() {
    creator = false;
    leaveRoomBtn.addEventListener('click', leaveStream);
    //Tell that the user is ready to receive the media
    socket.emit('ready', roomName, user);
});



//Once the client is ready we need to set up the ICE framework to let
// the users communicate
socket.on('ready', function(username) {
    userList.push(username);
    updateUserList();
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
            socket.emit('offer', offer, roomName, userList);
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

socket.on('offer', function(offer, users) {
    //The person joining the room (receiving the offer) has to go through the same steps as the creator
    if (!creator && !rtcPeerConnection[0]) {
        userList = [];
        userList = users.slice(0);
        updateUserList();
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



socket.on('end-stream', function() {
    leaveStream(true);
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


function updateUserList() {
    $('#users').html('');
    usersListHTML = '';
    for (username of userList) {
        usersListHTML += `
            <span>${username}</span>
            <br><hr>
        `;
    }
    $('#users').append(usersListHTML);
}