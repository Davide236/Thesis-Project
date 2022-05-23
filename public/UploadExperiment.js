let loader = document.getElementById('loader');
let loader_text = document.getElementById('loader-text');
let form = document.getElementById('exp-form');

//Show a 'loader' upon saving the experiment
window.onbeforeunload = function() {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('loader-text').style.display = 'block';
    document.getElementById('exp-form').style.display = 'none';
}