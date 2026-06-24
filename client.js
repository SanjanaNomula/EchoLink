let peer;

const connectBtn = document.getElementById("connectBtn");
const peerIdInput = document.getElementById("peerId");

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

    peer = new Peer(peerIdInput.value);

    console.log("Peer initialized");
});
