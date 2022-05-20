var experiments;
var totalExperiments;

var toShow = 3;

var order = true;

var arrowDown = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
</svg>`;

var arrowUp = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
</svg>`;


$(document).ready(function() {
    $.getJSON('../data/experiments')
    .then(saveExperiments)
    .then(loadExperiments)
});

function saveExperiments(exp) {
    experiments = exp;
}

$('#sortDirection').click(function() {
    order = !order;
    loadExperiments();
});

$('#loadExperiments svg').click(function() {
    toShow += 10;
    loadExperiments();
});

function setArrow() {
    $('#sortDirection').html('');
    if (order) {
        $('#sortDirection').append(arrowDown);
        return;
    }
    $('#sortDirection').append(arrowUp);
}


function loadExperiments() {
    setArrow();
    experiments = sortExperiments(experiments);
    totalExperiments = experiments.length;
    displayExperiments();
}

function displayExperiments() {
    $('#experiments').html('');
    experimentsHTML = '';
    for (i=0; i<toShow; i++) {
        if (i >= totalExperiments) {
            break;
        }
        experimentsHTML += 
            `<div class="row">
                <div class="col-4">
                    <video width="80%" height="80%" controls>
                        <source src="${experiments[i].video.url}">
                    </video>
                </div>
                <div class="col-8">
                    <h3><a href="../experiment/display-exp/${experiments[i]._id}">${experiments[i].name}</a></h3>
                    <p>${experiments[i].description}</p>
                </div>
            </div>
            `; 
    }
    $('#experiments').append(experimentsHTML);
}

/*Sort the reviews in the page depending on the user input*/
function sortExperiments(experiments) {
    if (order) {
        if ($('#sortSelect').val() == 'date') {
            experiments.sort((a, b) => (a.date < b.date) ? 1 : -1);
        } else {
            experiments.sort((a, b) => (a.name > b.name) ? 1 : -1);
        }
    } else {
        if ($('#sortSelect').val() == 'date') {
            experiments.sort((a, b) => (a.date > b.date) ? 1 : -1);
        } else {
            experiments.sort((a, b) => (a.name < b.name) ? 1 : -1);
        }
    }
    return experiments;
}