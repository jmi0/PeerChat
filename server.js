/*
 * @Author: joe.iannone 
 * @Date: 2021-01-06 13:04:28 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-01-09 11:10:49
 */


const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');


const PORT = process.env.PORT || 9000;


/***********************************************************************
 * Setup express app/server 
 */
const app = express();

app.use(express.static('build'));

// serve client build
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/build/index.html`));
});

// listen on PORT
const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});



/***********************************************************************
 * Setup peer server
 */
const peerServer = ExpressPeerServer(server, {
  allow_discovery: true,
  proxied: true
});


app.use('/peerserver', peerServer);




