let peer;

const connectBtn = document.getElementById("connectBtn");
const peerIdInput = document.getElementById("peerId");

connectBtn.addEventListener("click", () => {
    peer = new Peer(peerIdInput.value);

    console.log("Peer initialized");
});
