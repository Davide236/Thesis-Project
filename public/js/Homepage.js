function joinRoom() {
    var modal = document.getElementById("joinLiveModal");
    modal.style.display = "block";
}


//Close the modal
window.onclick = function(event) {
    var modal = document.getElementById("joinLiveModal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
}

async function askPermission() {
    let response = await getPermission();
    if (response) {
        window.location.replace("https://chemical-twins.herokuapp.com/experiment/create-live");
    } else {
        alert('Couldnt get permission to access the camera. Please give permission before accessing this functionality!');
    }
}

//Ask the users for permission to access video and audio devices
async function getPermission() {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
    //Start and immediately stop the stream
    .then(function(stream) {
        stream.getTracks()[0].stop();
        stream.getTracks()[1].stop();
        return true;
    })
    .catch(function(_err) {
        //Error
        return false;
    });
}


module.exports = {
    joinRoom,
    getPermission
}