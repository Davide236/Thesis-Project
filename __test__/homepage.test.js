const {joinRoom, getPermission} = require('../public/js/Homepage.js');

Object.assign(navigator, {
    mediaDevices: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: jest
          .fn()
          .mockReturnValue([
            { stop: jest.fn() },
            { stop: jest.fn() },
          ]),
      }),
    },
});

describe('Testing the DOM manipulation of Homepage.js', () => {
    jest.spyOn(navigator.mediaDevices, "getUserMedia");
    beforeEach(() => {
        document.body.innerHTML = `
        <div class="modal" id="joinLiveModal"></div>
        `;
        require('../public/js/Homepage.js');
    });

    it('Check if the modal is shown', () => {
        joinRoom();
        let modal = document.getElementById("joinLiveModal");
        expect(modal.style.display).toBe('block');
    });

    it('Ask permission for camera', async () => {
        let response = await getPermission();
        expect(response).toBe(true);
    });

});