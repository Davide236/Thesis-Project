let surveyIntro = document.getElementById('surveyIntro');
let progressBar = document.getElementById('progressBar');
let surveyForm = document.getElementById('surveyForm');
let questions = document.querySelectorAll('.questions');
let progress = document.getElementById('progress');

let counter = 0;
let total = 0;


function nextQuestion() {
    if (counter < total) {
        if (document.querySelector(`input[name="answer${counter+1}"]:checked`) == null) {
            return alert('Please answer the question before proceeding');
        }
        questions[counter].style.display = 'none';
        counter++;
        if (counter >= total) {
            showFinal();
            return;
        }
        questions[counter].style.display = 'block';
        progress.style.width = Math.ceil((counter/total)*100) + "%";
        progress.textContent = Math.ceil((counter/total)*100) + "%";
    }
}

function showFinal() {
    progress.style.width = "100%";
    progress.textContent = "100%";
    document.getElementById("finishSurvey").style.display = 'block';
}

function loadSurvey() {
    if (!document.getElementById('checkbox').checked) {
        return alert('Check terms and conditions to continue');
    }
    surveyIntro.style.display = 'none';
    progressBar.style.display = 'block';
    surveyForm.style.display = 'block';
    questions[0].style.display = 'block';
    total = questions.length;
}