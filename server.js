/*
 * @Author: joe.iannone 
 * @Date: 2021-01-06 13:04:28 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-01-09 18:19:48
 */


const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');
const moment = require('moment');
const Datastore = require('nedb');
const crypto = require('crypto-js');


const PORT = process.env.PORT || 9000;

/**********************************************************************
 * initialiaze nedb datastore for usernames
 */
const users = new Datastore({ filename: './.app_data/users.db', autoload: true });
// create unique index on username
users.ensureIndex({ fieldName: 'username', unique: true, sparse: true});
/*
users.insert({username: 'JoeIannone', passwordHash: crypto.SHA256('test').toString(crypto.enc.Base64), peerID: '', lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss') }, (err) => {
  if (err) console.log(err);
});
*/


/***********************************************************************
 * Setup express app/server 
 */
const app = express();

app.use(express.static('build'));

// serve client build
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/build/index.html`));
});

app.get('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  users.find({ username: username, passwordHash: crypto.SHA256(password).toString(crypto.enc.Base64)}, (err, docs) => {
    if (err) res.json({error: 1, msg: 'Something went wrong.'});
    else if (!docs.length)  res.json({nouser: 1, msg: 'Could not find user name.'});
    else {
      res.json({success: 1});
    }
  });
});

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




