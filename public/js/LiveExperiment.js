//Client side code
let socket = io.connect();

//Load all the different variables
let roomName = document.getElementById("roomName").innerHTML;
let user = document.getElementById("username").innerHTML;
let videoDevice = document.getElementById("videoDevice").innerHTML;
let dataType = document.getElementById('dataType').innerHTML;


//Select all the different buttons
let muteBtn = document.getElementById("muteBtn");
let hideCameraBtn = document.getElementById("hideCameraBtn");
let endStreamBtn = document.getElementById("endStreamBtn");
let leaveRoomBtn = document.getElementById("leaveRoomBtn");
let askQuestionBtn = document.getElementById("askQuestionBtn");
let showAnswerBtn = document.getElementById("showAnswerBtn");
let recordBtn = document.getElementById('recordBtn');
let stopRecordBtn = document.getElementById('stopRecordBtn');
let saveRecordBtn = document.getElementById('saveRecordBtn')

//Select all the different HTML elements that will be used later
let userVideo = document.getElementById("experiment-video");
let questionForm = document.getElementById('questionForm');
let sidebar = document.querySelector('.sidebar');
let sidebarContent = document.querySelector('.sidebar-content');
let experimentData = document.getElementById('experimentData');
let studentAnswers = document.getElementById('studentAnswers');
let dChart = document.getElementById('dataChart');
let sChart = document.getElementById('studentChart');
let currentData = document.getElementById('currentData');
let averageStudentAnswer = document.getElementById('averageAnswer');

document.getElementById("sidebarButton").addEventListener('click', toggleSidebar);

//Variable used for the recording of video/audio
let recording;
let recordingData = [];

//Array used for saving the data of the experiment
let recordingExperiment = [];

//See if we already displayed a second graph
let digitalCount = 0;

//Flag to see if the audio was muted
let muted = false;

//Flag to see if camera is hidden
let hidden = false;

//List of all the users connected to the stream
let userList = [];

//List of all answers from the questions asked to the students
let answerList = [];

//Variable that keeps track of how many numbers display on the graph
const MAX_GRAPH = 15;

//For graph
let time = 0;


//Global variable for the stream
let userStream;
//We use RTCPeerConnection to establish the connection
let rtcPeerConnection = [];
let index = -1;

//Provide a list of STUN servers used for the connection
let iceServers = {
    iceServers: [
        {
            urls: 'turn:numb.viagenie.ca:5766',
            credential: 'ChemicalTwins',
            username: 'chemicaltwinsRUG@gmail.com'
        },
        {
            urls: 'turn:numb.viagenie.ca:6156',
            credential: 'ChemicalTwins',
            username: 'chemicaltwinsRUG@gmail.com'
        },
        {urls: "stun:stun.services.mozilla.com"},
        {urls: "stun:stun1.l.google.com:19302"},
    ]
}

//Check if the user created or joined the room
let creator = false;

//When the document is ready join the room
window.onload = function() {
    if (navigator.userAgent.indexOf("Firefox") != -1) {
        alert('Click ok to continue');
    }
    userList.push(user);
    updateUserList();
    socket.emit('join', roomName);
};

//Before the page get unloaded we delete the room from the database
window.onbeforeunload = function() {
    if (creator) {
        deleteRoom();
    }
}

//Chart used to display the data from the sensors
const dataChart = new Chart(
    dChart,
    {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${dataType} at time t`,
                backgroundColor: 'rgb(9,158,41)',
                data: []
            }]
        },
        options: {
            scales: {
                y: {
                    title: {
                        display: true,
                        text: dataType
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (t)'
                    }
                }
            }
        }
    }
);

//Chart used to display the data from the student answers
const studentChart = new Chart(
    sChart,
    {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${dataType} at time t based on students answers`,
                backgroundColor: 'rgb(9,158,41)',
                data: []
            }]
        },
        options: {
            scales: {
                y: {
                    title: {
                        display: true,
                        text: dataType
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (t)'
                    }
                }
            }
        }
    }
);

//Function used to mute the stream
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

//Function used to hide the 'data elements' once the user opens the sidebar
function toggleSidebar() {
    questionForm.classList.toggle('material-hidden');
    experimentData.classList.toggle('material-hidden');
    studentAnswers.classList.toggle('material-hidden');

    sidebar.classList.toggle('sidebar-shown');
    sidebarContent.classList.toggle('sidebar-content-shown');
}

//Function used to hide the camera during the stream
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

//Function which sends a GET request to the application in order to delete the room
function deleteRoom() {
    $.ajax({
        url: `https://chemical-twins.herokuapp.com/experiment/delete/${roomName}`,
        type: 'GET',
        success: function(res) {alert(res)},
        error: function(res) {alert('Code '+res.status +':' + res.responseText)}
    });
}

//Function, fired by the creator of the stream, used to end the stream
function endStream(flag) {
    if (flag != true) {
        //Ask the user if they're sure they want to end the stream
        if (!confirm("Are you sure you want to end the stream?")) {
            return;
        }
        window.onbeforeunload = null;
    }

    //Tell all connected users that the stream is ending
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

    //Delete the stream
    deleteRoom();
    //Redirect to homepage
    window.location.replace('/experiment/leave');
}

//Function used to add a value in a given chart
function addToChart(chart,val) {
    recordingExperiment.push(val);
    chart.data.labels.push(time);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(val);
    });
    checkRemove(chart);
    chart.update();
}

//Function which is used to remove the first value (if MAX_GRAPH is exceeded) from a given graph
function checkRemove(chart) {
    length = chart.data.labels.length;
    if (length > MAX_GRAPH) {
        chart.data.labels.splice(0,1);
        chart.data.datasets.forEach((dataset) => {
            dataset.data.splice(0,1);
        });
    }
}

//Socket listens when data arrives and adds it to the chart
socket.on('data', function(values, student_val, average_answer) {
    time++;
    addToChart(dataChart,values);
    currentData.textContent = values;
    //If we're also receiving data from the student answers then we display the second chart
    if (student_val) {
        if (!digitalCount) {
            digitalCount++;
            sChart.style.display = 'block';
            averageStudentAnswer.style.display = 'block';
            averageStudentAnswer.innerHTML = `<strong>Average Answer</strong> ${average_answer}`;
        }
        addToChart(studentChart, student_val);
    }
});



function leaveStream(flag) {
    //If the flag is null it means that the user wants to leave
    //if the flag is true than it means that the creator ended the stream and the other users
    //are being 'kicked out'
    if (flag != 'true'&& flag != 'leave') {
        //Ask the user if they're sure they want to leave the stream
        if (!confirm("Are you sure you want to leave the stream?")) {
            return;
        }
        window.onbeforeunload = null;
        socket.emit('user-left', roomName, user);
    } 

    if (flag == 'leave') {
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

//Display the question
function showQuestion() {
    questionForm.style.display = "block";
}

//Close the question form
function closeQuestionForm() {
    questionForm.style.display = "none";
}


//The creator of the stream ask a question to all the connected users. This question
//will also consist of some numeric values that the user can decide from, to answer it
function askQuestion() {
    let question = document.getElementById('question').value;
    const answers = document.querySelectorAll('.answers');
    let answerPoll = [];
    //list of all possible answers
    answers.forEach(answer => {
        answerPoll.push(Number(answer.innerText));
        answer.remove();
    });
    socket.emit('question', roomName, question, answerPoll);
    answerList.splice(0,answerList.length);
    closeQuestionForm();
}

//The user answer the questions and send its answer to the creator
function answerQuestion() {
    let answer = document.getElementById('select-answer').value;
    socket.emit('user-answer', roomName, answer, user);
    closeQuestionForm();
}

//Close the answer form (where the creator can see the students answers)
function closeAnswerForm() {
    studentAnswers.style.display = 'none';
}

//Function which displays the answer form where the creator of the stream
//can see the answer each connected-user gave in response to the question
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

//Function which saves the student answers to the database
function saveAnswers() {
    $.ajax({
        type: "POST",
        url: `https://chemical-twins.herokuapp.com/data/add-answers/${roomName}`,
        data: {answers: answerList},
        success: function (data) {alert('Code 200 :'+ data); },
        error: function (data) { alert('Code '+data.status +':' + data.responseText); }
    });
    closeAnswerForm();
}

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
    }
});

//Event which signals that a user left the stream
socket.on('user-left', function(user) {
    let idx = userList.indexOf(user);
    userList.splice(idx,1);
    updateUserList();
});

//Get the device ID for the video of the stream
async function getDeviceId() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.label == videoDevice)
}

//Function which connects the user camera to the stream
async function getCamera() {
    let device = await getDeviceId();
    let deviceId = device[0].deviceId
    navigator.mediaDevices.getUserMedia({
        audio: {'echoCancellation': true},
        video: {'deviceId': deviceId, width: 640, height: 480}
    })
    .then(function(stream) {
        recordBtn.disabled = false;
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

//Function which is used to record the video stream of the creator
function recordVideo() {
    try {
        //Create a new media recording element
        recording = new MediaRecorder(userStream);
        recordBtn.disabled = true;
        stopRecordBtn.disabled = false;
        //Start saving data
        recording.ondataavailable = function(event) {
            if (event.data && event.data.size > 0) {
                recordingData.push(event.data);
            }
        }
        recording.start();
        alert('Started recording');
    } catch(err) {
        alert('Cant record due to the following error: ' + err);
        return;
    }
}

//Stop the video recording
function stopRecording() {
    saveRecordBtn.disabled = false;
    recordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    recording.stop();
}

//Save the recording of the video along with the data from sensors
function saveRecording() {
    //Save the video on a Blob element and then save it to mp4
    const video_blob = new Blob(recordingData, {type: 'video/mp4'});
    const video_blobUrl = window.URL.createObjectURL(video_blob);
    const video_link = document.createElement('a');
    video_link.style.display = 'none';
    video_link.href = video_blobUrl;
    video_link.download = 'experiment_video.mp4';
    document.body.appendChild(video_link);
    video_link.click();
    //Save the data on a Blob element and then save it to json
    const data_blob = new Blob([JSON.stringify(recordingExperiment)], {type: 'application/json'});
    const data_blobUrl = window.URL.createObjectURL(data_blob);
    const data_link = document.createElement('a');
    data_link.style.display = 'none';
    data_link.href = data_blobUrl;
    data_link.download = 'experiment_data.json';
    document.body.appendChild(data_link);
    data_link.click();
}

//Get user media if a room is created of joined
socket.on('created', async function(server) {
    creator = true;
    //Add list of STUN and TURN servers
    //iceServers = JSON.parse(JSON.stringify(server));
    //iceServers = { iceServers: server};
    //Add event listeners for the creators' buttons
    hideCameraBtn.addEventListener('click', hideStream);
    muteBtn.addEventListener('click', muteStream);
    endStreamBtn.addEventListener('click', endStream);
    askQuestionBtn.addEventListener('click', showQuestion);
    showAnswerBtn.addEventListener('click', showAnswer);
    recordBtn.addEventListener('click', recordVideo);
    stopRecordBtn.addEventListener('click', stopRecording);
    saveRecordBtn.addEventListener('click', saveRecording);
    //Get the stream from the creator
    await getCamera();
    //mute video of creator
    userVideo.muted = true;
});

//A user joins the room
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
        //#################
        //rtcPeerConnection[index].ontrack = OnTrackFunction;
        //#############à####
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
    if (creator) {
        var icecandidate = new RTCIceCandidate(candidate);
        rtcPeerConnection[index].addIceCandidate(icecandidate);
    }
});

//The person joining the room gets an offer from the creator to establish the connection
socket.on('offer', function(offer, users, server) {
    //The person joining the room (receiving the offer) has to go through the same steps as the creator
    if (!creator && !rtcPeerConnection[0]) {
        //Setting ICE servers sent from the creator
        //iceServers = JSON.parse(JSON.stringify(server));
        console.log(iceServers);
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

//The creator gets back the answer from the user
socket.on('answer', function(answer) {
    if (creator) {
        //Set the answer as remote description
        rtcPeerConnection[index].setRemoteDescription(answer);
    }
});


//Signal of ending the stream
socket.on('end-stream', function() {
    leaveStream('true');
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
        console.log('GETTING STREAM');
        userVideo.srcObject = event.streams[0];
        console.log(userVideo.srcObject);
        //onloadedmetadata onloadeddata ontrack
        userVideo.onloadedmetadata = function(e) {
            userVideo.play();
        }
    }
}

//Update the users list whenever a user wants to join a room
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

//Function used to add a possible answer choice among the answer list
function addToAnswerList(value) {
    let inputHTML = `
    <span class='answers' onclick='this.remove()'><span>${value}</span></span>`;
    $('#answer-list').append(inputHTML);
}

//Get the value of one of the answer choice and add it to the list
function addAnswerValue() {
    let value = document.getElementById('answerOption').value;
    $('#answer-input').html('');
    addToAnswerList(value);
}

//Function which adds different possible answers to be asked in combination with a question
function addAnswerInput() {
    $('#answer-input').html('');
    let inputHTML = `
    <form action="javascript:void(0);">
        <input id="answerOption" name="answerOption" type="number">
        <button type="submit" id="plus-btn" onclick='addAnswerValue()'><strong>+</strong></button>
    </form>
    `
    $('#answer-input').append(inputHTML);
}