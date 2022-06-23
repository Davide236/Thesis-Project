const {startSimulation,
    id} = require('../public/js/Experiment.js');

//Test which tests the functions of the file Experiment.js
describe('Testing the DOM manipulation of Experiment.js', () => {

    beforeEach(() => {
        //We need to use the html body to mock some of the dom manipulation
        document.body.innerHTML = `
        <p id="exp_id" hidden><%=experiment._id%></p>
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
        `;
    });

    it('Example', () => {
        console.log(id);
        startSimulation();
    });

});