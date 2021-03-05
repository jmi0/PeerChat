# PeerChat

## P2P chat PWA with client side data persistence.

### Features:
- Real time peer discovery and connection state observation
- Persistent conversations and connections (client side) 
- Multimedia messaging: images, attachments, emojis
- Offline messaging (messages are transmitted as soon as recipient peer is back online)
- End to end encryption of messages
- User profiles and custom settings
- Microsoft Teams-like UI
- Mobile and offline first design
- JWT authentication


<br><br>
### Docker:
```
docker pull jiannone/peerchat:latest
docker run -p 9000:9000 -d jiannone/peerchat
```
Docker Repo: [https://hub.docker.com/layers/jiannone/peerchat/latest/images/sha256-72fa71fe0f17761a7072adf180d9180f09954214aeb875c800d649d91207527b?context=repo](https://hub.docker.com/layers/jiannone/peerchat/latest/images/sha256-72fa71fe0f17761a7072adf180d9180f09954214aeb875c800d649d91207527b?context=repo)
<br><br>

### Desktop UI:
<img src="./demo/img/PeerChat1.png" width="100%" />
<img src="./demo/img/PeerChat2.png" width="100%" /> 

### Mobile UI:
<p float="left">
  <img src="./demo/img/PeerChat3.png" width="30%" />
  <img src="./demo/img/PeerChat4.png" width="30%" /> 
</p>

---

Developed using TypeScript, React, Redux, PeerJS, Dexie, Material-UI