let passwordControl = document.getElementById('passwordSign');
let feedback = document.getElementById('feedback');
let show = false;
//Pattern for the password
let pattern = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

//At each input on the password this function checks whether the password is valid or not
passwordControl.addEventListener('input', checkValidPassword);

//Function which check if the password is valid and gives feedback to the user
function checkValidPassword() {
    if ((!pattern.test(passwordControl.value) && !show) || !passwordControl.value) {
      feedback.style.color = 'red';
      feedback.textContent = 'Password needs to have 8 characters including a uppercase letter and a number';
    } else {
      feedback.style.color = 'rgb(9,158,41)';
      feedback.textContent = 'Password valid';
    }
}

//Functions to toggle the password form on and off
function openPasswordForm() {
    document.getElementById("passwordForm").style.display = "block";
}
  
function closePasswordForm() {
    document.getElementById("passwordForm").style.display = "none";
}


//Function which shows the password based on which password eye is clicked
function showPassword(action) {
    console.log('SHOWING PASSWORD');
    console.log(action);
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