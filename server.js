/*
 * @Author: joe.iannone 
 * @Date: 2021-01-06 13:04:28 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:47:05
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


const PORT = process.env.PORT || 9000;

const JWT_SECRET = 'WWB42bAX6qnyVytguzxSj';

// object to hold peer ids (keyed with username)
var peers = {};

// initialiaze nedb datastore for usernames
const users = new Datastore({ filename: './.app_data/users.db', autoload: true });
// create unique index on username
users.ensureIndex({ fieldName: 'username', unique: true, sparse: true });



/**
 * Setup express app/server 
 */
const app = express();

if (app.get('env') === 'production') app.set('trust proxy', 1);

// middleware for serving client app
app.use(express.static('build'));

// middlewares for cookies and http body
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



/**
 * middleware function to validate JWT 
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
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


/**
 * Serve client build
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/build/index.html`));
});


/**
 * login endpoint
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // check nedb for username password hash combination
  users.findOne({ username: username, passwordHash: crypto.SHA256(password).toString(crypto.enc.Base64)}, (err, doc) => {
    if (err) res.json({error: 1, msg: 'Something went wrong.'});
    else if (!doc) res.json({nouser: 1, msg: 'Could not find user name and password combination.'});
    else {
      // sign JWT and respond to client
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


/**
 * logout endpoint - simply removes refresh token cookie
 */
app.post('/logout', (req, res) => {
  res.clearCookie('refresh_token');
  res.json({success:1});
});


/**
 * sign up endpoint
 */
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  // insert username password hash combination
  users.insert({
    username: username, 
    passwordHash: crypto.SHA256(password).toString(crypto.enc.Base64), 
    peerID: '', 
    refreshToken: crypto.SHA256(`${username}${password}${JWT_SECRET}${moment().format('YYYY-MM-DD HH:mm:ss')}`).toString(crypto.enc.Base64), 
    lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') 
  }, (err) => {
    if (err) res.json({error: err});
    else {
      // sign JWT and respond to client
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


/**
 * peers endpoint - peers that are online
 */
app.get('/peers', validateToken, (req, res) => {
  // get peers that are currently online
  users.find({ peerID: { $in: Object.keys(peers) }}, { username: 1, peerID: 1, _id: 0}, function (err, docs) {
    if (err) res.json({error:1});
    else {
      // create peers object or peer ids keyed by username before response
      let peers = {};
      docs.forEach((doc) => { peers[doc.username] = doc; });
      res.json(peers);
    }
  });
});


/**
 * update peerid endpoint - used to associate peerid and username on server side
 */
app.post('/updatepeerid', validateToken,  (req, res) => {
  const { peerid, username } = req.body;
  users.update({ username: username }, { $set: { peerID: peerid, lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') } }, {}, function (err, numReplaced) {
    if (err) res.json({error:1});
    else if (numReplaced == 0) res.json({error:1});
    else res.json({success:1});
  });
});


/**
 * test endpont to check if token is valid
 */
app.post('/checktoken', validateToken, (req, res) => {
  res.json({success:1, username: req.username });
});


/**
 * refresh token endpoint
 */
app.post('/refreshtoken', (req, res) => {
  const { refresh_token } = req.cookies;
  // check request refresh token against database to find valid user
  users.findOne({ refreshToken: refresh_token }, (err, doc) => {
    if (err) res.json({error: 1, msg: 'Something went wrong.'});
    else if (!doc) res.json({invalidtoken: 1, msg: 'Invalid token.'});
    else {
      // sign new JWT and respond
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


/**
 * Port listener
 */
const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});



/****************************************************************
 ****************************************************************
 ***************************************************************/
/**
 * Setup peer server
 */
const peerServer = ExpressPeerServer(server, {
  allow_discovery: true,
  proxied: true
});

// middleware for peer server
app.use('/peerserver', peerServer);

// peer server connection listener
peerServer.on('connection', (client) => {
  // add peerd id to peers object
  peers[client.id] = client.id;
});

// peer server disconnect listener
peerServer.on('disconnect', (client) => {
  // remove this peer id from peers object
  delete peers[client.id];
});

