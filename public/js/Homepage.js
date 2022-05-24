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