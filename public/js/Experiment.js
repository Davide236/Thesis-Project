const URL = 'https://chemical-twins.herokuapp.com';

//Get variables
let id = document.getElementById('exp_id').innerHTML;
let minutes;
let seconds;
let dataType;

//Select html elements
let sidebar;
let sidebarContent;
let experimentData;
let chart;
let currentData;
let simulatedData;
let simulationBtn;
let simulationForm;

let video;

let data;

//Variable that keeps track of how many numbers display on the graph
const MAX_GRAPH = 15;

//Index used to keep track of the data array and to be used as label for the graph
let index = 0;


//Flag for signalling the beginning of the data display
let sendingData = false;

//Value of the simulation
let value = 0;
//Flag that signals if we have to show the simulation
let simulationData = false;

//Chart which displays the recorded data
let dataChart;

function setChart() {
    dataChart = new Chart(
        chart,
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    name: 'Sensor',
                    label: `${dataType} at time t`,
                    backgroundColor: 'rgb(9,158,41)',
                    data: []
                },
                {
                    name: 'Simulation',
                    label: `${dataType} based on the simulation`,
                    backgroundColor: 'rgb(66, 152, 245)',
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
}

function setVariables() {
    minutes = document.getElementById('minutes').innerHTML;
    seconds = document.getElementById('seconds').innerHTML;
    dataType = document.getElementById('dataType').innerHTML;
    sidebar = document.querySelector('.sidebar');
    sidebarContent = document.querySelector('.sidebar-content');
    experimentData = document.getElementById('experimentData');
    chart = document.getElementById('dataChart');
    currentData = document.getElementById('currentData');
    simulatedData = document.getElementById('simulatedData');
    simulationBtn = document.getElementById('simulationBtn');
    simulationForm = document.getElementById('simulationForm');
    video = document.getElementById('recorded-video');
}

//Get the recorded data from the database
window.onload = function() {
    $.ajax({
        url: `${URL}/data/get-data/${id}`,
        type: 'GET',
        success: function(res) {data = res.slice();},
        error: function(res) {alert('Code '+res.status +':' + res.responseText)},
        complete: function() {setVariables(); setChart(); addListeners();}
    });
};

//Add listeners to the video element
function addListeners() {
    document.getElementById("sidebarButton").addEventListener('click', toggleSidebar);
    simulationBtn.addEventListener('click', startSimulation);
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
            if (dataset.name == 'Sensor') {
                dataset.data.push({y:data[index], x: index});
            } else if (simulationData) {
                let simulation = getSimulatedData(value);
                //Round to first decimal
                simulatedData.textContent = Math.round(simulation * 10) /10;
                dataset.data.push({y: simulation, x: index});
            }
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
            if (dataset.data.length > MAX_GRAPH) {
                dataset.data.splice(0,1);
            }
        });
    }
}


//Function to hide the contents containing the data if the user opens the sidebar
function toggleSidebar() {
    experimentData.classList.toggle('material-hidden');
    sidebar.classList.toggle('sidebar-shown');
    sidebarContent.classList.toggle('sidebar-content-shown');
}

//Open the simulation form and pause the video
function startSimulation() {
    video.pause();
    simulationForm.style.display = 'block';

}

//Close the simulation form and resume the video
function closeSimulation() {
    video.play();
    simulationForm.style.display = 'none';
}

//Function which gets the value of the simulation the user wants to try
function trySimulation() {
    value = Number(document.querySelector('input[name="LED"]:checked').value);
    simulationData = true;
    return value;
}


module.exports = {
    startSimulation,
    setVariables, 
    closeSimulation, 
    trySimulation,
    setChart,
    updateChart,
    addListeners,
    sendingData,
}