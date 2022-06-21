//Function which, based on the value of the intensity of the LED
//will output a 'simulation' value of the Photoresistor based on previous
//tests and experiments. This is supposed to give the student and idea on 
//how the actual data might change if the value of the LED changes
function getSimulatedData(val) {
    //Approximation of the base luminosity value
    Base_Luminosity = 0.55;
    LED_luminosity = (22)*(val/100);
    return 500/(LED_luminosity+Base_Luminosity) + 50
}

module.exports = {
    getSimulatedData
}