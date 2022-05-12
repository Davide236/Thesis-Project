window.onload = async function() {
    $('#videoDevice').html('');
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


async function getVideoDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind == 'videoinput')
}
