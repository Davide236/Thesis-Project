//Get a list of all the connected video devices so that the user can choose which one to use
window.onload = async function() {
    $('#videoDevice').html('');
    let devices = await getVideoDevices();
    videoDeviceHTML = '';
    for (dev of devices) {
        videoDeviceHTML += `
        <option>${dev.label}</option>
        `;
    }
    $('#videoDevice').append(videoDeviceHTML);
};

//Get the list of connected video devices to display to the user
async function getVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind == 'videoinput')
}

module.exports = {
    getVideoDevices
}