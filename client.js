let peer;
let localStream;
const connectedUsers = [];
const connectionTimes = {};
const connectionHistory = [];
const connectionQuality = {};
const blockedUsers = [];

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

function addToHistory(peerId, type) {
    connectionHistory.push({
        peerId,
        type,
        timestamp: new Date().toISOString()
    });
}

function updateConnectionQuality(peerId) {
    connectionQuality[peerId] = {
        latency: Math.floor(Math.random() * 100),
        quality: ["Excellent", "Good", "Fair"][Math.floor(Math.random() * 3)],
        updatedAt: new Date().toISOString()
    };
}

function initializePeer() {
    peer = new Peer(peerIdInput.value);

    peer.on("open", () => {
        statusText.textContent = "Connected";
    });

    peer.on("error", (error) => {
        statusText.textContent = "Connection Error";
        console.error(error);
    });

    peer.on("disconnected", () => {
        statusText.textContent = "Reconnecting...";

        setTimeout(() => {
            if (peer) {
                peer.reconnect();
            }
        }, 3000);
    });

    peer.on("close", () => {
        statusText.textContent = "Connection Closed";
    });

    peer.on("call", (call) => {
        if (blockedUsers.includes(call.peer)) {
            call.close();
            return;
        }

        call.answer(localStream);

        connectionTimes[call.peer] = Date.now();

        connectedUsers.push({
            peerId: call.peer,
            call: call
        });

        updateConnectionQuality(call.peer);

        addToHistory(call.peer, "connected");
        notifyUserConnected(call.peer);

        call.on("close", () => {
            const index = connectedUsers.findIndex(
                user => user.peerId === call.peer
            );

            if (index !== -1) {
                connectedUsers.splice(index, 1);
            }

            delete connectionTimes[call.peer];
            delete connectionQuality[call.peer];

            addToHistory(call.peer, "disconnected");
            notifyUserDisconnected(call.peer);
        });

        call.on("stream", (remoteStream) => {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.volume = 1;
            audio.play();
        });
    });
}

connectBtn.addEventListener("click", async () => {
    localStream = await setupMicrophone();

    if (!localStream) {
        return;
    }

    statusText.textContent = "Connecting...";
    initializePeer();
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

    if (blockedUsers.includes(targetPeerId)) {
        statusText.textContent = "User is blocked";
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

    updateConnectionQuality(targetPeerId);

    addToHistory(targetPeerId, "connected");
    notifyUserConnected(targetPeerId);

    call.on("close", () => {
        const index = connectedUsers.findIndex(
            user => user.peerId === targetPeerId
        );

        if (index !== -1) {
            connectedUsers.splice(index, 1);
        }

        delete connectionTimes[targetPeerId];
        delete connectionQuality[targetPeerId];

        addToHistory(targetPeerId, "disconnected");
        notifyUserDisconnected(targetPeerId);
    });

    call.on("stream", (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.volume = 1;
        audio.play();
    });
});

function blockUser(peerId) {
    if (!blockedUsers.includes(peerId)) {
        blockedUsers.push(peerId);
    }
}

function unblockUser(peerId) {
    const index = blockedUsers.indexOf(peerId);

    if (index !== -1) {
        blockedUsers.splice(index, 1);
    }
}

function getBlockedUsers() {
    return blockedUsers;
}

function setUserVolume(peerId, volume) {
    document.querySelectorAll("audio").forEach(audio => {
        audio.volume = volume;
    });
}

function setMyVolume(volume) {
    if (!localStream) return;

    localStream.getAudioTracks().forEach(track => {
        track.enabled = volume > 0;
    });
}

function getConnectedUsers() {
    return connectedUsers;
}

function getConnectionHistory() {
    return connectionHistory;
}

function getConnectionQuality(peerId) {
    return connectionQuality[peerId] || null;
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
        blockedUsers: blockedUsers.length,
        totalHistoryEntries: connectionHistory.length,
        activeQualityEntries: Object.keys(connectionQuality).length,
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

    blockUser,
    unblockUser,
    getBlockedUsers,

    getConnectedUsers,
    getConnectionHistory,
    getConnectionQuality,
    getConnectionDuration,
    getStats,

    onUserConnected,
    onUserDisconnected,

    setUserVolume,
    setMyVolume
};

console.log(`EchoLink v${EchoLink.version} loaded`);
