var connection_code;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null;
var screenSharing = false;
var conn = null;

window.createConnection = function() {
    notify("Initiating Connection");
    console.log("Initiating Connection");
    let connection = window.connectionCode;
    connection_code = connection;
    peer = new Peer(connection_code);
    peer.on('open', (id) => {
        notify("Establishing Connection");
        console.log("Establishing Connection");
        console.log("Connecting with Id: " + connection_code);      
        setTimeout(() => {
            document.getElementById('check').style.color = 'green';
            }, 2100);
        hostSideSetup();
    });
    peer.on('call', (call) => {
        console.log("Receiving Call from Remote");
        call.answer(local_stream);
        call.on('stream', (stream) => {
            console.log("Call Received");
            console.log(stream);
            setRemoteStream(stream);
        });
        currentPeer = call;
    });
}

window.setScreenSharingStream = function(stream) {
    console.log("Setting Screen Share");
    document.getElementById("screenshare-container").hidden = false;
    let video = document.getElementById("screenshared-video");
    video.srcObject = stream;
    video.muted = true;
    video.play().catch(error => {
        console.error("Error playing video:", error);
    });
}

window.setRemoteStream = function(stream) {
    console.log("Setting Remote Screen");
    document.getElementById("remote-vid-container").hidden = false;
    let video = document.getElementById("remote-video");
    video.srcObject = stream;
    video.play().catch(error => {
        console.error("Error playing remote screen:", error);
        });
}

window.notify = function(msg) {
    let notification = document.getElementById("notification");
    notification.innerHTML = msg;
    notification.classList.remove("hidden");
    notification.classList.add("visible");
    setTimeout(() => {
        notification.classList.remove("visible");
        notification.classList.add("hidden");
    }, 4000);
}

window.joinconnection = function() {
    notify("Initiating Connection with Host")
    console.log("Joining connection");
    let connection = document.getElementById("connection-input").value;
    if (connection.trim() === "") {
        notify("Please Enter Connection Id");
        return;
    }
    connection_code = connection;
    peer = new Peer();
    peer.on('open', (id) => {
        console.log("Connection Id: " + id);
        notify("Connected with Host");
        conn = peer.connect(connection_code);
        setTimeout(()=>{
            document.getElementById("tohost").hidden = false;
        },2000)
    });
}

window.startScreenShare = function() {
    if (screenSharing) {
        stopScreenSharing();
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
            setScreenSharingStream(stream);
            screenStream = stream;
            let videoTrack = screenStream.getVideoTracks()[0];
            videoTrack.onended = () => {
                stopScreenSharing();
            };
            if (peer) {
                let sender = currentPeer.peerConnection.getSenders().find(function(s) {
                    return s.track.kind == videoTrack.kind;
                });
                    sender.replaceTrack(videoTrack);
                    screenSharing = true;
                }
            console.log(screenStream);
        }).catch((error) => {
            console.error("Error accessing screen for sharing: ", error);
            });
    } else {
        console.error("getDisplayMedia is not supported in this browser.");
        notify("Screen sharing is not supported in this browser. Please use a compatible browser like Chrome, Firefox, or Edge.");
    }
}

window.stopScreenSharing = function() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        console.log('Screen Sharing Stopped');
        notify("Screen Sharing Stopped")
        screenStream = null;
        if (conn) {
            conn.send('SCREEN_SHARE_STOPPED');
        }
    } else {
        console.log('No Screens to Stop');
    }
}

window.hostSideSetup = function() {
    if (!peer) {
        console.error("Connection not Initialized");
        return;
    }
    peer.on('connection', (connection) => {
        conn = connection;
        conn.on('data', (data) => {
            if (data === 'SCREEN_SHARE_STOPPED') {
                console.log("Remote has Stopped Screen Sharing");
                document.getElementById("remote-vid-container").hidden = true;
                notify("Remote has Stopped Screen Sharing");
                document.getElementById('check').style.display = 'none';
            }
        });
    });
}

window.shareScreenToHost = function() {
    console.log("Sharing Screen with Host");
    const createMediaStreamFake = () => {
        return new MediaStream([createEmptyAudioTrack(), createEmptyVideoTrack({ width: 360, height: 240 })]);
    }

    const createEmptyAudioTrack = () => {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        const track = dst.stream.getAudioTracks()[0];
        return Object.assign(track, { enabled: false });
    }

    const createEmptyVideoTrack = ({ width, height }) => {
        const canvas = Object.assign(document.createElement('canvas'), { width, height });
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, width, height);

        const stream = canvas.captureStream();
        const track = stream.getVideoTracks()[0];

        return Object.assign(track, { enabled: false });
        };

    notify("Connecting with Host")
    let call = peer.call(connection_code, createMediaStreamFake())
    call.on('stream', (stream) => {
        setRemoteStream(stream);
        })

    currentPeer = call;
    startScreenShare();
}