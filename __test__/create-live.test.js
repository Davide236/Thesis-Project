const {getVideoDevices} = require('../public/js/CreateLiveForm.js');

Object.assign(navigator, {
    mediaDevices: {
        enumerateDevices: () => {
            return device = [{
                deviceId: "ExampleDevice",
                kind: "videoinput"
                }]
        },
    },
 });

describe('Testing the taking the camera functionalities of CreateLiveForm.js', () => {
    jest.spyOn(navigator.mediaDevices, "enumerateDevices");
    beforeEach(() => {
        document.body.innerHTML = `
        <div class="form-group">
        <label for="videoDevice">Video device:</label>
        <select id="videoDevice" class="form-select" name="videoDevice"></select>
         </div>
        `;
    });


    it('Testing getting video devices', async () => {
        let devices = await getVideoDevices();
        expect(devices[0].deviceId).toBe('ExampleDevice');
    });
});
