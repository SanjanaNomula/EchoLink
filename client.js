let peer = null;
let localStream = null;
let myStatus = "Online";

const connectedUsers = [];
const connectionTimes = {};
const connectionHistory = [];
const connectionQuality = {};
const blockedUsers = [];
const callRecords = [];
const userPresence = {};
const remoteAudio = {};

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
        return null;
    }
}

function notifyUserConnected(peerId) {
    userConnectedCallbacks.forEach(callback => callback(peerId));
}

function notifyUserDisconnected(peerId) {
    userDisconnectedCallbacks.forEach(callback => callback(peerId));
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

function updatePresence(peerId, status) {
    userPresence[peerId] = {
        status,
        updatedAt: new Date().toISOString()
    };
}

function startCallRecord(peerId) {
    callRecords.push({
        peerId,
        startedAt: new Date().toISOString(),
        endedAt: null,
        duration: 0
    });
}

function endCallRecord(peerId) {
    const record = [...callRecords]
        .reverse()
        .find(record => record.peerId === peerId && !record.endedAt);

    if (!record) {
        return;
    }

    record.endedAt = new Date().toISOString();

    record.duration = Math.floor(
        (new Date(record.endedAt) - new Date(record.startedAt)) / 1000
    );
}


function initializePeer() {
    peer = new Peer(peerIdInput.value.trim());

    peer.on("open", () => {
        statusText.textContent = "Connected";
        updatePresence(peer.id, "Online");
    });

    peer.on("error", (error) => {
        statusText.textContent = "Connection Error";
        console.error(error);
    });

    peer.on("disconnected", () => {
        statusText.textContent = "Reconnecting...";
        updatePresence(peer.id, "Away");

        setTimeout(() => {
            if (peer && !peer.destroyed) {
                peer.reconnect();
            }
        }, 3000);
    });

    peer.on("close", () => {
        statusText.textContent = "Connection Closed";
        updatePresence(peer.id, "Offline");
    });

    peer.on("call", (call) => {

        if (blockedUsers.includes(call.peer)) {
            call.close();
            return;
        }

        if (localStream) {
           call.answer(localStream);
        } else {
               call.close();
               return;
        }

        connectionTimes[call.peer] = Date.now();
        startCallRecord(call.peer);

        connectedUsers.push({
            peerId: call.peer,
            call: call
        });

        updateConnectionQuality(call.peer);
        updatePresence(call.peer, "Online");

        addToHistory(call.peer, "connected");
        notifyUserConnected(call.peer);

        call.on("stream", (remoteStream) => {
            const audio = new Audio();

            audio.srcObject = remoteStream;
            audio.autoplay = true;
            audio.volume = 1;

            remoteAudio[call.peer] = audio;

            audio.play();
        });

        call.on("close", () => {

            const index = connectedUsers.findIndex(
                user => user.peerId === call.peer
            );

            if (index !== -1) {
                connectedUsers.splice(index, 1);
            }

            if (remoteAudio[call.peer]) {
                remoteAudio[call.peer].pause();
                remoteAudio[call.peer].srcObject = null;
                delete remoteAudio[call.peer];
            }

            delete connectionTimes[call.peer];
            delete connectionQuality[call.peer];

            updatePresence(call.peer, "Offline");

            endCallRecord(call.peer);

            addToHistory(call.peer, "disconnected");

            notifyUserDisconnected(call.peer);
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

    const targetPeerId = targetPeerIdInput.value.trim();

    if (!targetPeerId) {
        statusText.textContent = "Enter target peer ID";
        return;
    }

    if (blockedUsers.includes(targetPeerId)) {
        statusText.textContent = "User is blocked";
        return;
    }

    // Reuse the microphone stream instead of requesting it again
    if (!localStream) {
    statusText.textContent = "Microphone not available";
    return;
}

const call = peer.call(targetPeerId, localStream);

    connectionTimes[targetPeerId] = Date.now();
    startCallRecord(targetPeerId);

    connectedUsers.push({
        peerId: targetPeerId,
        call: call
    });

    updateConnectionQuality(targetPeerId);
    updatePresence(targetPeerId, "Online");

    addToHistory(targetPeerId, "connected");
    notifyUserConnected(targetPeerId);

    call.on("stream", (remoteStream) => {
        const audio = new Audio();

        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.volume = 1;

        remoteAudio[targetPeerId] = audio;

        audio.play();
    });

    call.on("close", () => {

        const index = connectedUsers.findIndex(
            user => user.peerId === targetPeerId
        );

        if (index !== -1) {
            connectedUsers.splice(index, 1);
        }

        if (remoteAudio[targetPeerId]) {
            remoteAudio[targetPeerId].pause();
            remoteAudio[targetPeerId].srcObject = null;
            delete remoteAudio[targetPeerId];
        }

        delete connectionTimes[targetPeerId];
        delete connectionQuality[targetPeerId];

        updatePresence(targetPeerId, "Offline");
        endCallRecord(targetPeerId);

        addToHistory(targetPeerId, "disconnected");
        notifyUserDisconnected(targetPeerId);
    });
});

function setStatus(status) {
    myStatus = status;

    if (peer) {
        updatePresence(peer.id, status);
    }
}

function getStatus() {
    return myStatus;
}

function getPresence(peerId) {
    return userPresence[peerId] || null;
}

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
    return [...blockedUsers];
}

function getCallRecords() {
    return [...callRecords];
}

function setUserVolume(peerId, volume) {
    const audio = remoteAudio[peerId];

    if (!audio) {
        return;
    }

    audio.volume = Math.max(0, Math.min(1, volume));
}

function setMyVolume(volume) {
    if (!localStream) {
        return;
    }

    const enabled = volume > 0;

    localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
    });
}

function getConnectedUsers() {
    return [...connectedUsers];
}

function getConnectionHistory() {
    return [...connectionHistory];
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
        totalCallRecords: callRecords.length,
        activeQualityEntries: Object.keys(connectionQuality).length,
        peerId: peer ? peer.id : null,
        status: myStatus,
        version: "1.0.0"
    };
}

function onUserConnected(callback) {
    if (typeof callback === "function") {
        userConnectedCallbacks.push(callback);
    }
}

function onUserDisconnected(callback) {
    if (typeof callback === "function") {
        userDisconnectedCallbacks.push(callback);
    }
}

window.EchoLink = {
    version: "1.0.0",

    connect() {
        connectBtn.click();
    },

    callUser(peerId) {
        targetPeerIdInput.value = peerId;
        callBtn.click();
    },

    setStatus,
    getStatus,
    getPresence,

    blockUser,
    unblockUser,
    getBlockedUsers,

    getConnectedUsers,
    getConnectionHistory,
    getConnectionQuality,
    getConnectionDuration,
    getCallRecords,
    getStats,

    onUserConnected,
    onUserDisconnected,

    setUserVolume,
    setMyVolume
};

console.log(`EchoLink v${window.EchoLink.version} loaded`);
