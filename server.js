/*
 * @Author: joe.iannone 
 * @Date: 2021-01-06 13:04:28 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-09 23:25:07
 */


const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');
const moment = require('moment');
const Datastore = require('nedb');
const crypto = require('crypto-js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');



var peers = {};

const PORT = process.env.PORT || 9000;

const JWT_SECRET = 'WWB42bAX6qnyVytguzxSj';


/**********************************************************************
 * initialiaze nedb datastore for usernames
 */
const users = new Datastore({ filename: './.app_data/users.db', autoload: true });
// create unique index on username
users.ensureIndex({ fieldName: 'username', unique: true, sparse: true });



/***********************************************************************
 * Setup express app/server 
 */
const app = express();

if (app.get('env') === 'production') app.set('trust proxy', 1);

app.use(express.static('build'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// on each request
app.use((req, res, next) => {
  next();
});


const validateToken = (req, res, next) => {
  let token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, JWT_SECRET, function(err, decoded) {
    if (err) {
      if (err.name === 'TokenExpiredError') res.json({error:1, tokenexpired:1});
      else res.json({error:err});
    } else {
      req.body.username = decoded.username;
      next();
    }
  });
};

// serve client build
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/build/index.html`));
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  users.findOne({ username: username, passwordHash: crypto.SHA256(password).toString(crypto.enc.Base64)}, (err, doc) => {
    if (err) res.json({error: 1, msg: 'Something went wrong.'});
    else if (!doc) res.json({nouser: 1, msg: 'Could not find user name and password combination.'});
    else {
      jwt.sign({ username: doc.username }, JWT_SECRET, { expiresIn: 30 }, function(err, token) {
        if (err) res.json({error: err});
        else {
          res.cookie('refresh_token', doc.refreshToken);
          res.json({success: 1, username: doc.username, token: token });
        }
      });
    }
  });
});


app.post('/logout', (req, res) => {
  res.clearCookie('refresh_token');
  res.json({success:1});
});


app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  users.insert({username: username, passwordHash: crypto.SHA256(password).toString(crypto.enc.Base64), peerID: '', refreshToken: crypto.SHA256(`${username}${password}${JWT_SECRET}${moment().format('YYYY-MM-DD HH:mm:ss')}`).toString(crypto.enc.Base64), lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') }, (err) => {
    if (err) res.json({error: err});
    else {
      jwt.sign({ username: username }, JWT_SECRET, { expiresIn: 30 }, function(err, token) {
        if (err) res.json({error: err});
        else {
          res.cookie('refresh_token', crypto.SHA256(`${username}${password}${JWT_SECRET}${moment().format('YYYY-MM-DD HH:mm:ss')}`).toString(crypto.enc.Base64));
          res.json({success: 1, username: username, token: token });
        }
      });
    }
  });
});


app.get('/peers', validateToken, (req, res) => {
  // get peers that are currently online
  users.find({ peerID: { $in: Object.keys(peers) }}, { username: 1, peerID: 1, _id: 0}, function (err, docs) {
    if (err) res.json({error:1});
    else {
      let peers = {};
      docs.forEach((doc) => { peers[doc.username] = doc; });
      res.json(peers);
    }
  });
});


app.post('/updatepeerid', validateToken,  (req, res) => {
  const { peerid, username } = req.body;
  users.update({ username: username }, { $set: { peerID: peerid, lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') } }, {}, function (err, numReplaced) {
    if (err) res.json({error:1});
    else if (numReplaced == 0) res.json({error:1});
    else res.json({success:1});
  });
});


app.post('/checktoken', validateToken, (req, res) => {
  res.json({success:1, username: req.username });
});


app.post('/refreshtoken', (req, res) => {
  const { refresh_token } = req.cookies;
  users.findOne({ refreshToken: refresh_token }, (err, doc) => {
    if (err) res.json({error: 1, msg: 'Something went wrong.'});
    else if (!doc) res.json({invalidtoken: 1, msg: 'Invalid token.'});
    else {
      jwt.sign({ username: doc.username }, JWT_SECRET, { expiresIn: 30 }, function(err, token) {
        if (err) res.json({error: err});
        else {
          res.cookie('refresh_token', doc.refreshToken);
          res.json({success: 1, username: doc.username, token: token });
        }
      });
    }
  });
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

