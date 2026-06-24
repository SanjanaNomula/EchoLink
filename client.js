let peer;

const connectBtn = document.getElementById("connectBtn");

connectBtn.addEventListener("click", () => {
    peer = new Peer();

    console.log("Peer initialized");
});
