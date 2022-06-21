const {getSimulatedData} = require('../public/js/Simulation.js');

describe('Testing the simulation functions', () => {

    it('Check the return value of the simulation function for LED:0', () => {
        let answer = getSimulatedData(0);
        expect(answer).toBeGreaterThanOrEqual(900);
        expect(answer).toBeLessThan(1000);
    });

    it('Check the return value of the simulation function for LED:20', () => {
        let answer = getSimulatedData(20);
        expect(answer).toBeGreaterThanOrEqual(150);
        expect(answer).toBeLessThan(200);
    });

    it('Check the return value of the simulation function for LED:40', () => {
        let answer = getSimulatedData(40);
        expect(answer).toBeGreaterThanOrEqual(100);
        expect(answer).toBeLessThan(140);
    });

    it('Check the return value of the simulation function for LED:60', () => {
        let answer = getSimulatedData(60);
        expect(answer).toBeGreaterThanOrEqual(85);
        expect(answer).toBeLessThan(100);
    });

    it('Check the return value of the simulation function for LED:80', () => {
        let answer = getSimulatedData(80);
        expect(answer).toBeGreaterThanOrEqual(75);
        expect(answer).toBeLessThan(85);
    });

    it('Check the return value of the simulation function for LED:100', () => {
        let answer = getSimulatedData(100);
        expect(answer).toBeGreaterThanOrEqual(60);
        expect(answer).toBeLessThan(75);
    });
});
