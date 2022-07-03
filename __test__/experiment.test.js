const {startSimulation, setVariables, closeSimulation, trySimulation} = require('../public/js/Experiment.js');
describe('Testing the DOM manipulation of Experiment.js', () => {
    console.error = jest.fn()
    beforeEach(() => {
        //We need to use the html body to mock some of the dom manipulation
        document.body.innerHTML = `
        <%- include ("./partials/Navbar") %>
        <%- include ("./partials/FlashMessage") %>
        <p id="exp_id" hidden><%=experiment._id%></p>
        <p id="minutes" hidden>0</p>
        <p id="seconds" hidden>0</p>
        <p id="dataType" hidden><%=experiment.dataType%></p>
        <div class="row">
        <div class="col-7">
            <video id="recorded-video" width="80%" height="80%" controls>
                <source src="<%=experiment.video.url%>">
            </video>
            <div class="btn-group">
                <button id="simulationBtn">Simulation</button>
            </div>
        </div>
        <div class="col-5">
            <!--Data of the experiment-->
            <div id="experimentData">
                <canvas id="dataChart"></canvas>
                <br><hr>
                <strong>Current Data: </strong> <span id="currentData"></span>
                <br><hr>
                <strong>Simulated Data: </strong> <span id="simulatedData"></span>
                <br><hr>
                <form action="#" class="form-container" style="display: none;" id="simulationForm">
                    <div class="form-elements">
                            <h3>Simulation</h3>
                            <br><hr>
                            <div class="form-group" id="simulationAnswers">
                                <label for="question">What intensity of the LED you want (0-100)? </label>
                                <input type="radio" name="LED" value="20" checked>20
                                <input type="radio" name="LED" value="40">40
                                <input type="radio" name="LED" value="60">60
                                <input type="radio" name="LED" value="80">80
                                <input type="radio" name="LED" value="100">100
                            </div>
                            <br><hr>
                            <button type="button" onclick="trySimulation()">Try</button>
                            <button type="button" onclick="closeSimulation()">Close</button>
                    </div>
                </form>
            </div>
            <div class="sidebar">
                <button id="sidebarButton">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-left-square" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm11.5 5.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
                    </svg>
                </button>
                <div class="sidebar-content">
                    <div class="experiment-info">
                        <h3>Experiment Info</h3>
                        <br><hr>
                        <strong>Creator: </strong> <span><%=fullName%></span>
                        <br><hr>
                        <strong>Experiment Name: </strong> <span><%=experiment.name%></span>
                        <br><hr>
                        <strong>Description: </strong> <span><%=experiment.description%></span>
                        <br><hr>
                    </div>
                </div>
            </div>
        </div>
    </div>

        `;
        require('../public/js/Experiment.js');
        setVariables();
    });

    it('Opening Simulation', () =>  {
        startSimulation();
        let sim = document.getElementById('simulationForm');
        expect(sim.style.display).toBe('block');
    });

    it('Closing Simulation', () =>  {
        closeSimulation();
        let sim = document.getElementById('simulationForm');
        expect(sim.style.display).toBe('none');
    });

    it('Getting Simulation value', () =>  {
        let val = trySimulation();
        expect(val).toBe(20);
    });
});