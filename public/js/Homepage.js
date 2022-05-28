// Get the modal
var modal = document.getElementById("joinLiveModal");


function joinRoom() {
    modal.style.display = "block";
}


//Close the modal
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


//Ask the users for permission to access video and audio devices
async function askPermission() {
  navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
  })
  //Start and immediately stop the stream
  .then(function(stream) {
      stream.getTracks()[0].stop();
      stream.getTracks()[1].stop(); 
      return Promise.resolve("Success");
  })
  .catch(function(_err) {
      //Error
      return Promise.resolve("Error");
  });
}
