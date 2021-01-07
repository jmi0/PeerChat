/*
 * @Author: joe.iannone 
 * @Date: 2021-01-06 13:04:28 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-01-07 09:35:58
 */


const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');


const PORT = process.env.PORT || 9000;

// object to hold available peers
let peers = {};



/***********************************************************************
 * Setup express app/server 
 */
const app = express();

app.use(express.static('build'));

// serve client build
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/build/index.html`));
});

// endpoint to access available peers
app.get('/peers', (req, res) => {
  res.json(peers);
});

// listen on PORT
const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});



/***********************************************************************
 * Setup peer server
 */
const peerServer = ExpressPeerServer(server, {});

// when a peer connects
peerServer.on('connection', (peer) => {
  // add peer to available peers object
  peers[peer.id] = peer.id;
  console.log(`CONNECTED : ${peer.id}`);
});


// peer disconnects
peerServer.on('disconnect', (peer) => {
  // remove peer from available peers object
  delete peers[peer.id];
  console.log(`DISCONNECTED : ${peer.id}`);
});

app.use('/peerserver', peerServer);




