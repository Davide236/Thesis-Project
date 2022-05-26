//Functions to toggle the password form on and off
function openPasswordForm() {
  document.getElementById("passwordForm").style.display = "block";
}
  
function closePasswordForm() {
  document.getElementById("passwordForm").style.display = "none";
}


function showPassword(action) {
  let eye;
  let password;
  //Check if the user wants to see login or signup password
  if (action == 'login') {
    eye = document.getElementById('logEye');
    password = document.getElementById('passwordLog');
  } else {
    eye = document.getElementById('signEye');
    password = document.getElementById('passwordSign');
  }
  //Check if password is shown or not
  let type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  eye.classList.toggle('fa-eye-slash');
}