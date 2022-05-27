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
  //Check which 'eye' the user wants to toggle
  switch (action) {
    case 'login':
      eye = document.getElementById('logEye');
      password = document.getElementById('passwordLog');
      break;
    case 'signup':
      eye = document.getElementById('signEye');
      password = document.getElementById('passwordSign');
      break;
    default:
      eye = document.getElementById('eye');
      password = document.getElementById('password');
      break;
  }
  //Check if password is shown or not
  let type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  eye.classList.toggle('fa-eye-slash');
}