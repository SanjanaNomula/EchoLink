let peer;
let localStream;

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
        console.error("Microphone access denied", error);
    }
}

connectBtn.addEventListener("click", async () => {
    localStream = await setupMicrophone();

    statusText.textContent = "Connecting...";

    peer = new Peer(peerIdInput.value);

    peer.on("open", () => {
        statusText.textContent = "Connected";
    });

    peer.on("call", (call) => {
        call.answer(localStream);

        console.log("Incoming call answered");
    });

    console.log("Peer initialized");
});

callBtn.addEventListener("click", async () => {
    const targetPeerId = targetPeerIdInput.value;

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });

    peer.call(targetPeerId, stream);

    console.log("Calling:", targetPeerId);
});
