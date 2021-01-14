/*
 * @Author: joe.iannone 
 * @Date: 2021-01-06 13:04:28 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-01-14 10:55:53
 */


const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');
const moment = require('moment');
const Datastore = require('nedb');
const crypto = require('crypto-js');
const session = require('express-session');
const bodyParser = require('body-parser');

var peers = {};

const PORT = process.env.PORT || 9000;

/**********************************************************************
 * initialiaze nedb datastore for usernames
 */
const users = new Datastore({ filename: './.app_data/users.db', autoload: true });
// create unique index on username
users.ensureIndex({ fieldName: 'username', unique: true, sparse: true });
/*
users.insert({username: 'gideon', passwordHash: crypto.SHA256('agent').toString(crypto.enc.Base64), peerID: '', lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') }, (err) => {
  if (err) console.log(err);
});
users.insert({username: 'joe', passwordHash: crypto.SHA256('iannone').toString(crypto.enc.Base64), peerID: '', lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') }, (err) => {
  if (err) console.log(err);
});
users.insert({username: 'rossi', passwordHash: crypto.SHA256('agent').toString(crypto.enc.Base64), peerID: '', lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') }, (err) => {
  if (err) console.log(err);
});
*/


/***********************************************************************
 * Setup express app/server 
 */
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())

if (app.get('env') === 'production') app.set('trust proxy', 1)

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: 60 * 60000, // 1 hour
    secure: (app.get('env') === 'production')
  }
}))


app.use(express.static('build'));


// on each request
app.use((req, res, next) => {

  next();
});

// serve client build
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/build/index.html`));
});


app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  users.findOne({ username: username, passwordHash: crypto.SHA256(password).toString(crypto.enc.Base64)}, (err, doc) => {
    if (err) res.json({error: 1, msg: 'Something went wrong.'});
    else if (!doc) res.json({nouser: 1, msg: 'Could not find user name and password combination.'});
    else {
      req.session.username = doc.username
      res.json({success: 1});
    }
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({success: 1});
});


app.post('/updatepeerid', (req, res) => {
  const username = req.body.username;
  const peerid = req.body.peerid;

  if (typeof req.session.username === 'undefined') res.json({error:1});
  else if (req.session.username !== username) res.json({error:1});
  else {
    // renew session
    req.session.touch();
    // update users peerid
    users.update({ username: username }, { $set: { peerID: peerid, lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') } }, {}, function (err, numReplaced) {
      if (err) res.json({error:1});
      else if (numReplaced == 0) res.json({error:1});
      else res.json({success:1});
    });
  }
});


app.get('/peers', (req, res) => {
  // get peers that are currently online
  users.find({ peerID: { $in: Object.keys(peers) }}, { username: 1, peerID: 1 }, function (err, docs) {
    if (err) res.json({error:1});
    else res.json(docs);
  });
});

app.get('/check', (req, res) => {
  res.json(req.session);
})

app.post('/register', (req, res) => {

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


peerServer.on('connection', (client) => {
  peers[client.id] = client.id;
  //console.log("Server: Peer connected with ID:", client.id);
});

peerServer.on('disconnect', (client) => {
  delete peers[client.id];
  //console.log("Server: Peer disconnected with ID:", client.id);
});

