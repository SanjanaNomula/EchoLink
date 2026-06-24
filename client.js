let peer;

const connectBtn = document.getElementById("connectBtn");
const peerIdInput = document.getElementById("peerId");
const statusText = document.getElementById("status");

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
    const stream = await setupMicrophone();

    statusText.textContent = "Connecting...";
    
    peer = new Peer(peerIdInput.value);

    peer.on("open", () => {
    statusText.textContent = "Connected";
});

    console.log("Peer initialized");
});
