# EchoLink Architecture

## Overview

EchoLink is a lightweight browser-based voice communication library built on top of PeerJS and WebRTC.

## Components

### Client Layer

Responsible for:

* User interaction
* Peer initialization
* Audio controls
* Status updates

### PeerJS Layer

Responsible for:

* Peer discovery
* Signaling
* Connection establishment

### WebRTC Layer

Responsible for:

* Audio transmission
* Media streams
* Real-time communication

## Connection Flow

```text
User A
   |
PeerJS Signaling
   |
User B
   |
WebRTC Audio Stream
```

## Core Modules

### Connection Manager

Handles:

* Peer creation
* Reconnection
* Error handling

### Audio Manager

Handles:

* Microphone access
* Audio playback
* Volume controls
* Mute functionality

### User Manager

Handles:

* Connected users
* Presence information
* Connection history
* User events

## Future Expansion

* Voice channels
* Group calling
* End-to-end encryption
* Video support
