let socket = io.connect();

//Socket listens when data arrives and adds it to the chart
socket.on('data', function(values) {
    time++;
    addToChart(dataChart,values);
    currentData.textContent = values;
});

//The creator gets the answers from the students and saves them
socket.on('user-answer', function(answer, username) {
    if (creator) {
        answerList.push({username, answer});
        showAnswer();
    }
});

//When the 'creator' asks a question then the other users will receive this event
//and they will be displayed as well as the possible options for it
socket.on('question', function(question, answers) {
    if (!creator) {
        $('#questionAsked').html('');
        $('#questionAsked').append(question);
        $('#select-answer').html('');
        let selectHTML = '';
        answers.forEach(answer => {
            selectHTML += `
            <option value=${answer}>${answer}</option>
            `;
        });
        $('#select-answer').append(selectHTML);
        showQuestion();
        //Start the simulation for the user answer
        startSimulation();
    }
});


//Event which signals that a user left the stream
socket.on('user-left', function(user) {
    let idx = userList.indexOf(user);
    userList.splice(idx,1);
    updateUserList();
});

//Get user media if a room is created of joined
socket.on('created', async function(server) {
    creator = true;
    //Add ICE Servers for the stream
    iceServers = { iceServers: server};
    //Add event listeners for the creators' buttons
    hideCameraBtn.addEventListener('click', hideStream);
    muteBtn.addEventListener('click', muteStream);
    endStreamBtn.addEventListener('click', endStream);
    askQuestionBtn.addEventListener('click', showQuestion);
    showAnswerBtn.addEventListener('click', showAnswer);
    recordBtn.addEventListener('click', recordVideo);
    stopRecordBtn.addEventListener('click', stopRecording);
    saveRecordBtn.addEventListener('click', saveRecording);
    stopSimulationBtn.addEventListener('click', stopSimulation);
    //Get the stream from the creator
    await getCamera();
    //mute video of creator
    userVideo.muted = true;
});


//A user joins the room
socket.on('joined', function() {
    creator = false;
    leaveRoomBtn.addEventListener('click', leaveStream);
    simulationBtn.addEventListener('click', startSimulation);
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
        index += 1
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
            socket.emit('offer', offer, roomName, userList, iceServers);
        })
        .catch(function(err) {
            console.log(err);
        });
    }
});

//Exchange of public address information between ICE candidates
socket.on('candidate', function(candidate) {
    let icecandidate = new RTCIceCandidate(candidate);
    if (creator) {
        rtcPeerConnection[index].addIceCandidate(icecandidate);
    } else {
        clientRtcPeerConnection.addIceCandidate(icecandidate);
    }
});

//The person joining the room gets an offer from the creator to establish the connection
socket.on('offer', function(offer, users, server) {
    //The person joining the room (receiving the offer) has to go through the same steps as the creator
    if (!creator && !clientRtcPeerConnection) {
        //Save list of ICE Servers sent from the experiment creator
        iceServers = JSON.parse(JSON.stringify(server));
        userList = [];
        userList = users.slice(0);
        updateUserList();
        clientRtcPeerConnection = new RTCPeerConnection(iceServers);
        clientRtcPeerConnection.onicecandidate = OnIceCandidateFunction;
        clientRtcPeerConnection.ontrack = OnTrackFunction;
        //Set offer as remote description
        clientRtcPeerConnection.setRemoteDescription(offer);
        //The one joining doesn't create an offer but instead creates an answer
        clientRtcPeerConnection.createAnswer()
        .then(function(answer) {
            clientRtcPeerConnection.setLocalDescription(answer)
            socket.emit('answer', answer, roomName);
        })
        .catch(function(err) {
            console.log(err);
        });
    }
});

//The creator gets back the answer from the user and saves it
socket.on('answer', function(answer) {
    if (creator) {
        rtcPeerConnection[index].setRemoteDescription(answer);
    }
});


//Signal of ending the stream
socket.on('end-stream', function() {
    leaveStream('true');
});

//Set a simulation constant that will not change anymore
socket.on('stop_simulation', function() {
    simulationConstant = getSimulatedData(simulationValue);
    simulationBtn.style.display = 'none';
});

