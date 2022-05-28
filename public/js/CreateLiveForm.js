//Get a list of all the connected video devices so that the user can choose which one to use
window.onload = async function() {
    $('#videoDevice').html('');
    await getPermission();
    let devices = await getVideoDevices();
    console.log(devices);
    videoDeviceHTML = '';
    for (dev of devices) {
        videoDeviceHTML += `
        <option>${dev.label}</option>
        `;
    }
    $('#videoDevice').append(videoDeviceHTML);
};

//Ask the users for permission to access video and audio devices
async function getPermission() {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
    //Start and immediately stop the stream
    .then(function(stream) {
        stream.getTracks()[0].stop();
        stream.getTracks()[1].stop(); 
    })
    .catch(function(_err) {
        //Error
        alert("Couldn't get permission to access camera");
    });
}

//Get the list of connected video devices to display to the user
async function getVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind == 'videoinput')
}
