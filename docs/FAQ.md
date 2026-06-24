# Frequently Asked Questions

## What is EchoLink?

EchoLink is a lightweight voice communication library built using PeerJS and WebRTC.

## Does EchoLink require a backend?

No. EchoLink uses PeerJS for signaling and WebRTC for peer-to-peer communication.

## Can I use EchoLink in my own project?

Yes. EchoLink is designed to be easily integrated into web applications.

## How do I connect to voice chat?

```javascript
EchoLink.connect();
```

## How do I call another user?

```javascript
EchoLink.callUser("peer123");
```

## How do I mute my microphone?

```javascript
EchoLink.setMyVolume(0);
```

## How do I view connection statistics?

```javascript
EchoLink.getStats();
```

## Does EchoLink support group voice chat?

Not yet. Group communication is planned for future releases.

## Which browsers are supported?

Modern versions of Chrome, Edge, Firefox, and other WebRTC-compatible browsers.
