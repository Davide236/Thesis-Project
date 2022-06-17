const {sortExperiments, displayExperiments} = require('../public/js/PastExperiments.js');
const $ = require('jquery');


describe('Testing the DOM manipulation of PastExperiments.js', () => {
    let experiments;

    let experimentHTML = `
    <div class="row"><div class="col-4">
    <video width="80%" height="80%" controls=""><source src="Example"></video>
    </div><div class="col-8">
    <h3><a href="../experiment/display-exp/id">Experiment 1</a></h3>
    <p>Description</p></div></div>
    `;

    beforeEach(() => {
        document.body.innerHTML = `
        <div class="row selection-row">
            <div class="col-4">
                <label for="sortSelect">Sorted By:</label>
                <select id="sortSelect" onchange="loadExperiments()">
                    <option value="date" selected>Date Added</option>
                    <option value="name">Alphabetically</option>
                </select>
            </div>
            <div class="col-1" id="sortDirection"></div>
        </div>
        <div class="container" id="experiments"></div>
        `;
        experiments = [
            {
                name: 'Experiment 1',
                video: {
                    url: 'Example'
                },
                description: 'Description',
                date: 22,
                _id: 'id'
            },
            {
                name: 'Number 2',
                date: 10,
                video: {
                    url: 'Example'
                },
                description: 'Description',
                _id: 'id'
            }
        ];
        
    });

    it('Experiments sorted by date', () => {
        let exp = sortExperiments(experiments, true);
        expect(exp[1].name).toBe('Experiment 1');
    });

    it('Experiments sorted by name', () => {
        let order = document.getElementById('sortSelect');
        order.value = 'name';
        let exp = sortExperiments(experiments, true);
        expect(exp[0].name).toBe('Experiment 1');
    });

    it('Show experiments to user', () => {
        displayExperiments(experiments, 1);
        let exp = document.getElementById('experiments');
        expect(exp.innerHTML.replace(/\s/g, "")).toBe(experimentHTML.replace(/\s/g, ""));
    });
});