const functions = require('../public/js/LiveExperiment.js');


describe('Testing the DOM manipulation of LiveExperiment.js', () => {
    console.error = jest.fn();
    beforeEach(() => {
        //We need to use the html body to mock some of the dom manipulation
        document.body.innerHTML = `
        <p id="roomName" hidden>room</p>
    <p id="username" hidden>username</p>
    <p id="videoDevice" hidden>camera</p>
    <p id="dataType" hidden>temp</p>
    <button id="joinBtn"><span> Click to join </span></button>
    <div class="row" id="hiddenRow" style="display: none;">
        <div class="col-7">
            <div class="btn-group">
                <!--Recording buttons for the creator-->
                <% if (creator) { %>
                <button id="recordBtn" disabled>Record</button>
                <button id="stopRecordBtn" disabled>Stop</button>
                <button id="saveRecordBtn" disabled>Save Recording</button>
                <% } %>
            </div>
            <video id="experiment-video"></video>
            <div class="btn-group">
                <!--Buttons for the creator only-->
                <% if (creator) { %>
                <button id="muteBtn">Mute</button>
                <button id="hideCameraBtn">Hide Camera</button>
                <button id="endStreamBtn">End Stream</button>
                <button id="askQuestionBtn">Ask Question</button>
                <button id="showAnswerBtn">Show Answers</button>
                <button id="stopSimulationBtn">Stop Simulations</button>
                <% } else { %>
                <!--Button for users other than the creator-->
                <button id="leaveRoomBtn">Leave</button>
                <button id="simulationBtn">Simulation</button>
                <% } %>
            </div>
        </div>
        <div class="col-5">
            <div class="form-popup" id="questionForm" style="display: none;">
                <!--Form used to ask questions to users (by the creator) and for the users to answer them-->
                <form action="#" class="form-container">
                    <div class="form-elements">
                        <% if (creator) { %>
                            <h3>Ask question</h3>
                
                            <div class="form-group mt-5">
                                <label for="question">Question: </label>
                                <textarea class="form-control" id="question" name="question" rows="2" required></textarea>
                            </div>
                            <br><hr>
                            <label>Answer List</label>
                            <div id="answer-list"></div>
                            <div id="answer-input"></div>
                            <br><hr>
                            <button type="button" onclick="addAnswerInput()">Add Answer</button>
                            <br><hr>
                            <button type="button" onclick="askQuestion()">Ask</button>
                            <button type="button" onclick="closeQuestionForm()">Close</button>
                        <% } else { %>
                            <h3>Answer question</h3>
                            <br><hr>
                            <span>Question: </span><p id="questionAsked"></p>
                            <div class="form-group mt-5">
                                <label for="answer">Answer: </label>
                                <select class="form-select" id="select-answer">
                                </select>
                            </div>

                            <button type="button" onclick="answerQuestion()">Answer</button>
                        <% } %>
                    </div>
                </form>
            </div>
            <!--This part displays for the creator only all the different answers that students gave to a question-->
            <div class="form-popup" id="studentAnswers" style="display: none;">
                <div class="row" id="answerFirstRow">
                    <div class="col-4"><strong><h4>User</h4></strong></div>
                    <div class="col-8"><strong><h4>Answer</h4></strong></div>
                </div>
                <div id="answerList">
                </div>
                <button type="button" onclick="saveAnswers()">Save</button>
                <button type="button" onclick="closeAnswerForm()">Close</button>
            </div>
            <!--Displaying of the recorded data during the experiment-->
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
                                <input type="radio" name="LED" value="20">20
                                <input type="radio" name="LED" value="40">40
                                <input type="radio" name="LED" value="60">60
                                <input type="radio" name="LED" value="80" checked>80
                                <input type="radio" name="LED" value="100">100
                            </div>
                            <br><hr>
                            <button type="button" onclick="trySimulation()">Try</button>
                            <button type="button" onclick="closeSimulation()">Close</button>
                    </div>
                </form>
            </div>
            <!--Sidebar for the experiment, where information such as the experiment name, description and user list are found-->
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
                        <strong>Name: </strong> <span>name</span>
                        <br><hr>
                        <strong>Description: </strong> <span>description</span>
                        <br><hr>
                        <strong>Data Type: </strong> <span>data type</span>
                        <br><hr>
                    </div>
                    <div class="users-list">
                        <h3>User List</h3>
                        <br><hr>
                        <div id="users"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

        `;
        functions.setVariables();
    });

    it('Opening Simulation', () =>  {
        functions.startSimulation();
        let sim = document.getElementById('simulationForm');
        expect(sim.style.display).toBe('block');
    });

    it('Closing Simulation', () =>  {
        functions.closeSimulation();
        let sim = document.getElementById('simulationForm');
        expect(sim.style.display).toBe('none');
    });

    it('Getting Simulation value', () =>  {
        let val = functions.trySimulation();
        expect(val).toBe(80);
    });

    it('Show question form', () => {
        functions.showQuestion();
        let questionForm = document.getElementById('questionForm');
        expect(questionForm.style.display).toBe('block');
    });

    it('Close question form', () => {
        functions.closeQuestionForm();
        let questionForm = document.getElementById('questionForm');
        expect(questionForm.style.display).toBe('none');
    });
});