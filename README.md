# EchoLink

A lightweight voice communication library built using WebRTC and PeerJS.

## Quick Start

Include PeerJS and EchoLink:

```html
<script src="https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js"></script>
<script src="client.js"></script>
```

Connect to voice:

```javascript
EchoLink.connect();
```

Call another user:

```javascript
EchoLink.callUser("peer123");
```

Mute microphone:

```javascript
EchoLink.setMyVolume(0);
```

Get statistics:

```javascript
console.log(EchoLink.getStats());
```
