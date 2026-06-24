let peer;
let localStream;
const connectedUsers = [];
const connectionTimes = {};

const userConnectedCallbacks = [];
const userDisconnectedCallbacks = [];

const connectBtn = document.getElementById("connectBtn");
const peerIdInput = document.getElementById("peerId");
const statusText = document.getElementById("status");

const targetPeerIdInput = document.getElementById("targetPeerId");
const callBtn = document.getElementById("callBtn");

async function setupMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        console.log("Microphone access granted");
        return stream;
    } catch (error) {
        statusText.textContent = "Microphone access denied";
        console.error("Microphone access denied", error);
    }
}

function notifyUserConnected(peerId) {
    userConnectedCallbacks.forEach(callback => {
        callback(peerId);
    });
}

function notifyUserDisconnected(peerId) {
    userDisconnectedCallbacks.forEach(callback => {
        callback(peerId);
    });
}

connectBtn.addEventListener("click", async () => {
    localStream = await setupMicrophone();

    if (!localStream) {
        return;
    }

    statusText.textContent = "Connecting...";

    peer = new Peer(peerIdInput.value);

    peer.on("open", () => {
        statusText.textContent = "Connected";
    });

    peer.on("error", (error) => {
        statusText.textContent = "Connection Error";
        console.error(error);
    });

    peer.on("disconnected", () => {
        statusText.textContent = "Disconnected";
    });

    peer.on("call", (call) => {
        call.answer(localStream);

        connectionTimes[call.peer] = Date.now();

        connectedUsers.push({
            peerId: call.peer,
            call: call
        });

        notifyUserConnected(call.peer);

        call.on("close", () => {
            const index = connectedUsers.findIndex(
                user => user.peerId === call.peer
            );

            if (index !== -1) {
                connectedUsers.splice(index, 1);
            }

            delete connectionTimes[call.peer];

            notifyUserDisconnected(call.peer);
        });

        call.on("stream", (remoteStream) => {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.volume = 1;
            audio.play();
        });

        console.log("Incoming call answered");
    });

    console.log("Peer initialized");
});

callBtn.addEventListener("click", async () => {
    if (!peer) {
        statusText.textContent = "Connect first";
        return;
    }

    const targetPeerId = targetPeerIdInput.value;

    if (!targetPeerId) {
        statusText.textContent = "Enter target peer ID";
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });

    const call = peer.call(targetPeerId, stream);

    connectionTimes[targetPeerId] = Date.now();

    connectedUsers.push({
        peerId: targetPeerId,
        call: call
    });

    notifyUserConnected(targetPeerId);

    call.on("close", () => {
        const index = connectedUsers.findIndex(
            user => user.peerId === targetPeerId
        );

        if (index !== -1) {
            connectedUsers.splice(index, 1);
        }

        delete connectionTimes[targetPeerId];

        notifyUserDisconnected(targetPeerId);
    });

    call.on("stream", (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.volume = 1;
        audio.play();
    });

    console.log("Calling:", targetPeerId);
});

function setUserVolume(peerId, volume) {
    const user = connectedUsers.find(
        user => user.peerId === peerId
    );

    if (!user || !user.call) {
        return;
    }

    const audioElements = document.querySelectorAll("audio");

    audioElements.forEach(audio => {
        audio.volume = volume;
    });
}

function setMyVolume(volume) {
    if (!localStream) {
        return;
    }

    localStream.getAudioTracks().forEach(track => {
        track.enabled = volume > 0;
    });
}

function getConnectedUsers() {
    return connectedUsers;
}

function getConnectionDuration(peerId) {
    if (!connectionTimes[peerId]) {
        return 0;
    }

    return Math.floor(
        (Date.now() - connectionTimes[peerId]) / 1000
    );
}

function getStats() {
    return {
        connectedUsers: connectedUsers.length,
        peerId: peer ? peer.id : null,
        status: statusText.textContent,
        version: "1.0.0"
    };
}

function onUserConnected(callback) {
    userConnectedCallbacks.push(callback);
}

function onUserDisconnected(callback) {
    userDisconnectedCallbacks.push(callback);
}

window.EchoLink = {
    version: "1.0.0",

    connect: () => connectBtn.click(),

    callUser: (peerId) => {
        targetPeerIdInput.value = peerId;
        callBtn.click();
    },

    getConnectedUsers,
    getConnectionDuration,
    getStats,
    onUserConnected,
    onUserDisconnected,
    setUserVolume,
    setMyVolume
};

console.log(`EchoLink v${EchoLink.version} loaded`);
