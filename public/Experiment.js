let id = document.getElementById('exp_id').innerHTML;
let minutes = document.getElementById('minutes').innerHTML;
let seconds = document.getElementById('seconds').innerHTML;
let dataType = document.getElementById('dataType').innerHTML;


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

let index = 0;

//For graph
let time = 0;


let sendingData = false;

const dataChart = new Chart(
    chart,
    {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                //Add kind of data
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

//When the document is ready join the room
window.onload = function() {
    $.ajax({
        url: `http://localhost:3000/data/get-data/${id}`,
        type: 'GET',
        success: function(res) {data = res.slice();},
        error: function(res) {alert('Code '+res.status +':' + res.responseText)},
        complete: function() {addListeners();}
    });
};


function addListeners() {
    console.log(minutes, seconds);
    video.addEventListener('pause', ()=> {
        sendingData = false;
    });
    video.addEventListener('timeupdate', () => {
        if (video.currentTime >= (minutes*60) + seconds) {
            sendingData = true;
        }
    });
    video.addEventListener('completed', () => {
        sendingData = false;
    });
    video.addEventListener('play', () => {
        if (video.currentTime >= (minutes*60) + seconds) {
            sendingData = true;
        }
    });
    
    setInterval(updateChart, 2000);
}

function updateChart() {
    if (sendingData) {
        if (index >= data.length) {
            sendingData = false;
            return;
        }
        dataChart.data.labels.push(index);
        dataChart.data.datasets.forEach((dataset) => {
            dataset.data.push(data[index]);
        });
        
        checkRemove();
        dataChart.update();
        currentData.textContent = data[index];
        index++;
    }
}


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



function toggleSidebar() {
    experimentData.classList.toggle('material-hidden');

    sidebar.classList.toggle('sidebar-shown');
    sidebarContent.classList.toggle('sidebar-content-shown');
}



function addToChart(val) {
    dataChart.data.labels.push(time);
    dataChart.data.datasets.forEach((dataset) => {
        dataset.data.push(val);
    });
    checkRemove();
    dataChart.update();
}


function checkRemove() {
    length = dataChart.data.labels.length;
    if (length > MAX_GRAPH) {
        dataChart.data.labels.shift();
        dataChart.data.datasets.forEach((dataset) => {
            dataset.data.shift();
        });
    }
}


