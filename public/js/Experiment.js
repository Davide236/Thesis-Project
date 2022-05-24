//Get variables
let id = document.getElementById('exp_id').innerHTML;
let minutes = document.getElementById('minutes').innerHTML;
let seconds = document.getElementById('seconds').innerHTML;
let dataType = document.getElementById('dataType').innerHTML;

//Select html elements
let sidebar = document.querySelector('.sidebar');
let sidebarContent = document.querySelector('.sidebar-content');
let experimentData = document.getElementById('experimentData');
let chart = document.getElementById('dataChart');
let currentData = document.getElementById('currentData');


const video = document.getElementById('recorded-video');

document.getElementById("sidebarButton").addEventListener('click', toggleSidebar);

let data;

//Variable that keeps track of how many numbers display on the graph
const MAX_GRAPH = 15;

//Index used to keep track of the data array and to be used as label for the graph
let index = 0;


//Flag for signalling the beginning of the data display
let sendingData = false;


//Chart which displays the recorded data
const dataChart = new Chart(
    chart,
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

//Get the recorded data from the database
window.onload = function() {
    $.ajax({
        url: `http://localhost:3000/data/get-data/${id}`,
        type: 'GET',
        success: function(res) {data = res.slice();},
        error: function(res) {alert('Code '+res.status +':' + res.responseText)},
        complete: function() {addListeners();}
    });
};

//Add listeners to the video element
function addListeners() {
    //If the user pauses the video then also the data stream is paused
    video.addEventListener('pause', ()=> {
        sendingData = false;
    });
    //The data stream starts at a certain timestamp (minutes/seconds) that the user previously specified
    //This function checks whether we reached that timestamp and if so set the flag to True
    video.addEventListener('timeupdate', () => {
        if (video.currentTime >= (minutes*60) + seconds) {
            sendingData = true;
        }
    });
    //Check if the video has been completed
    video.addEventListener('completed', () => {
        sendingData = false;
    });
    //Check if video started playing (especially after pausing it)
    video.addEventListener('play', () => {
        if (video.currentTime >= (minutes*60) + seconds) {
            sendingData = true;
        }
    });
    //Update the chart every 2 seconds
    setInterval(updateChart, 2000);
}

//Function which (if flag == True) sends data to the graph and updates it
function updateChart() {
    if (sendingData) {
        //Check if the data is finished
        if (index >= data.length) {
            sendingData = false;
            return;
        }
        //Push label on 'x-axis' (x.coordinates)
        dataChart.data.labels.push(index);
        //Push data on 'y-axis' (y.coordinates)
        dataChart.data.datasets.forEach((dataset) => {
            dataset.data.push(data[index]);
        });
        
        checkRemove();
        dataChart.update();
        currentData.textContent = data[index];
        index++;
    }
}

//This function checks if we're reached the maximum amount of data points displayed
//in the chart, if so we remove some previous ones
function checkRemove() {
    length = dataChart.data.labels.length;
    if (length > MAX_GRAPH) {
        //dataChart.data.labels.shift();
        dataChart.data.labels.splice(0,1);
        dataChart.data.datasets.forEach((dataset) => {
            dataset.data.splice(0,1);
        });
    }
}


//Function to hide the contents containing the data if the user opens the sidebar
function toggleSidebar() {
    experimentData.classList.toggle('material-hidden');

    sidebar.classList.toggle('sidebar-shown');
    sidebarContent.classList.toggle('sidebar-content-shown');
}



