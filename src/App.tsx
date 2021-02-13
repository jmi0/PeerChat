/*
 * @Author: joe.iannone 
 * @Date: 2021-02-09 23:10:24 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-13 11:44:53
 */

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Peer from 'peerjs';
import Dexie from 'dexie';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import CryptoJS from 'crypto-js';

import APP_CONFIG, { User, Connections, Messages, UserProfiles, UserProfile, UserSettings } from './App.config';
import { exists, refreshFetch } from './App.fn';
import reducer from './reducers';
import { updateOnline, UpdateSystemUser, updateMessages, UpdateBulkConnections, UpdateConnections, UpdateUserProfiles, updateToken, UpdateUserSettings } from './actions';

import LoginForm from './components/Login';
import OnlineList from './components/Online';
import ConnectionsList from './components/Connections';
import Messenger from './components/Messenger';
import AppHeader from './components/AppHeader';
import MessagesDisplay from './components/Messages';
import ChatHeader from './components/ChatHeader'
import RegisterForm from './components/Register'

import { Box } from '@material-ui/core';
import "./style/App.scss";
import './style/Chat.scss';


type AppState = {
  isLoading: boolean,
  isLoggedIn: boolean,
  user: User|false,
  token: string|false,
  peer: Peer|false,
  messages: Messages,
  online: Connections,
  connections: Connections,
  selectedUser: User|false,
  userProfiles: UserProfiles,
  userSettings: UserSettings|false
}

/**
 * Handles user authentication, peer dicovery, redux store subscription, 
 * peer creation, user data initialization
 * 
 */
class App extends Component<any, AppState> {

  // interval class var to handle peer discovery 
  discoveryInterval: number = 0;
  // setup redux store
  store = configureStore({reducer: reducer});
  // set up dexie
  db: Dexie = new Dexie('PeerChat');
  // class var to assign redux subscribe
  unsubscribe: any;

  constructor(props: any) {
    
    super(props);
    
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      user: false,
      token: false,
      peer: false,
      messages: {},
      online: {},
      connections: {},
      selectedUser: false,
      userProfiles: {},
      userSettings: false
    }

  }
  

  componentDidMount() {
    
    // dexies indexes
    this.db.version(1).stores({
      messages: '++id, seen, timestamp, from, to, sent, text, groupkey',
      user_profiles: '&username, firstname, lastname, bio, headline',
      user_connections: '&username',
      user_settings: '&username'
    });

    
    // Attempts JWT token refresh and initializes session with user data from indexedDB
    this.init();


    // subscribe to redux changes and update App state
    this.unsubscribe = this.store.subscribe(() => {
      
      const { system, chat } = this.store.getState();
      
      // re init if just logging in
      if (!this.state.isLoggedIn && system.isLoggedIn) {
        if (!this.state.peer || this.state.peer.destroyed) this.init();
      }
      // if just logging out destroy peer first
      if (this.state.isLoggedIn && !system.isLoggedIn) {
        if (this.state.peer) this.state.peer?.destroy();
      }
      
      // update app state on each redux store dispatch
      this.setState({
        isLoggedIn: system.isLoggedIn, 
        user: system.user, 
        token: system.token,
        selectedUser: chat.selectedUser,
        messages: chat.messages,
        connections: chat.connections,
        online: chat.online,
        userProfiles: chat.userProfiles,
        userSettings: system.userSettings
      });

    });

    // get available peers from server
    this.getRemotePeers();

    this.discoveryInterval = window.setInterval(() => {
      // update available/online peers every second
      this.getRemotePeers();
    }, 1000);

  }
  

  componentWillUnmount() {
    // destroy peer if exists - this will let peer server know you are offline
    if (this.state.peer) this.state.peer.destroy();
    // clear discovery interval on unmount to avoid memory leak
    clearInterval(this.discoveryInterval);
    // unsubscribe from redux store changes
    this.unsubscribe();
    // close dexie
    this.db.close();
  }


  /**
   * Retrieve available peers from peer server
   */
  getRemotePeers() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${this.state.token}`);
    refreshFetch('/peers', 'GET', headers, null)
    .then((result: any) => {
      // if token set then just update token, otherwise dispatch available peers
      if (exists(result.token)) this.store.dispatch(updateToken(result.token));
      else this.store.dispatch(updateOnline(result));
    })
    .catch((err) => {
      console.log(err);
    })
  }


  /**
   * Initialize peerjs peer and setup event listeners
   * @param token 
   * @param username : string
   * @returns peer: Peer
   */
  setUpPeer(token: string, username: string) : Peer {

    let peer = new Peer({
      host: window.location.hostname,
      port: 9000, 
      path: '/peerserver'
    });

    // get local peer id from peer server
    peer.on('open', (peerid) => {
      console.log(`Peer id is ${peerid}`);
      // associate peer id to username on server side
      this.updateUserPeerID(peerid, token);
    });

    // listen for connections
    peer.on('connection', (conn) => {

      // message receiver
      conn.on('data', (data) => {
        // decrypt
        data = JSON.parse(CryptoJS.AES.decrypt(data, `${username}-${APP_CONFIG.CLIENT_KEY}`).toString(CryptoJS.enc.Utf8));
        if (exists(data.message)) {
          // handle message
          // update message and add to indexedDB
          data.message.groupkey = `${data.message.to}-${data.message.from}`;
          // if sender is selected then update seen state here before saving
          if (this.state.selectedUser && this.state.selectedUser.username === data.message.from) data.message.seen = true;
          this.db.table('messages').add(data.message)
          .then((id) => { console.log(`Message added to IndexedDB`); })
          .catch((err) => { console.error(`Could not add message to IndexedDB: ${err}`); })
          .finally(() => {
            // dispatch message to redux store
            this.store.dispatch(updateMessages(data.message.from, data.message));
            // if connection not available from memory dispatch to redux store
            if (!exists(this.state.connections[data.message.from])) this.store.dispatch(UpdateConnections({username: data.message.from, peerID: conn.peer}));
          });
        }
        else if (exists(data.user_profile)) {
          // handle user profile
          // add user profile data to indexedDB
          this.db.table('user_profiles').put(data.user_profile)
          .then((id) => { console.log(`Updated user profile for ${data.user_profile.username} in IndexedDB`) })
          .catch((err) => { console.log(`Could not store user profile ${err}`); })
          .finally(() => { this.store.dispatch(UpdateUserProfiles(data.user_profile)); });

          // send any unsent messages back to this user
          if (this.state.user) {
            // retrieve messages that are 'unsent' to this user
            this.db.table('messages').where('from').equals(`${this.state.user.username}`).sortBy('timestamp')
            .then(messages => {
              messages.forEach((message) => {
                if (message.sent) return;
                if (message.to !== data.user_profile.username) return;
                // send on this connection
                conn.send({message: message});
                this.db.table('messages').update(message.id, {sent: true}).then((updated) => {
                  if (!updated) console.log(`Could not update sent state of ${message.id}`);
                })
              });
            })
            .catch((err) => { console.error(err); });   
          }

        }
      })

      // connection receiver
      conn.on('open', () => {
        // connected
        console.log('Connected', conn);
      });

    });


    peer.on('disconnected', () => {
      console.log('disconnected');
    });


    peer.on('error', (err) => {
      console.log(`ERROR: ${err.message}`);
    });

    return peer;
  }


  /**
   * Update this users peerid on server
   * This is used to associate the variable peerid with the static username
   * @param peerid 
   * @param token 
   */
  updateUserPeerID(peerid: string, token: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    refreshFetch('/updatepeerid', 'POST', headers, JSON.stringify({peerid:peerid}))
    .then((result: any) => {
      //update token if necessary
      if (exists(result.token)) this.setState({token:result.token});
    })
    .catch((err) => {
      console.log(err);
    });
  }


  /**
   * try to refresh token to ensure user is logged in and retrieve various user data from indexedDB
   */
  init() {
    // try to refresh token
    fetch('/refreshtoken', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.json())
    .then((result) => {
      if (exists(result.username)) {

        // initialize peer and dispatch user data to redux store
        this.setState({ peer: this.setUpPeer(result.token, result.username)}, () => {
          this.store.dispatch(UpdateSystemUser(
            {username: result.username, peerID: ''}, 
            true, 
            false, 
            result.token
          ));
        });

        // retrieve past connections from indexedDB
        this.db.table('user_connections').where('username').equals(result.username)
        .first((user_connections) => {
          // dispatch connections to redux store
          if (typeof user_connections !== 'undefined') 
            this.store.dispatch(UpdateBulkConnections(JSON.parse(user_connections.connections)));
        }).catch((err) => { console.log(err); });

        // retrieve all user profiles from indexedDB
        this.db.table('user_profiles').toArray()
        .then((user_profiles: Array<UserProfile>) => {
          // dispatch user profiles to redux store
          if (user_profiles.length) 
            user_profiles.forEach((user_profile: UserProfile) => {
              this.store.dispatch(UpdateUserProfiles(user_profile));
            });
          else {
            // create empty profile for this user if none exist
            this.db.table('user_profiles').put({username: result.username})
            .then((id) => {
              // dispatch new profile to redux
              this.store.dispatch(UpdateUserProfiles({username: result.username}));
            })
            .catch((err) => { console.log(`Could create empty profile: ${err}`); });
          }
        }).catch((err) => { console.log(err); });

        // fail safe ensure this user has a profile more explicitly
        this.db.table('user_profiles').where('username').equals(result.username)
        .first((user_profile) => {
          // dispatch profile to redux or create new one and dispatch if it doesn't exist
          if (typeof user_profile !== 'undefined') this.store.dispatch(UpdateUserProfiles(user_profile));
          else this.db.table('user_profiles').put({username: result.username})
            .then((id) => {
              console.log(`Created user profile for ${result.username}`);
              this.store.dispatch(UpdateUserProfiles({username: result.username}));
            })
            .catch((err) => { console.log(err) });
        })
        .catch((err) => { console.log(err); })

        // retrieve user settings from indexedDB
        this.db.table('user_settings').where('username').equals(result.username)
        .first((user_settings) => {
          // dispatch user settings or initialize and dispatch
          if (typeof user_settings !== 'undefined') this.store.dispatch(UpdateUserSettings(user_settings));
          else {
            this.db.table('user_settings').put({username: result.username})
            .then((id) => { console.log(`Created user settings ${id} for ${result.username}`); })
            .catch((err) => { console.log(err); })
            .finally(() => {
              this.store.dispatch(UpdateUserSettings({
                username: result.username, 
                allowOffline: false,
                deleteMessagesOnLogout: false
              }));
            })
          }
        })
        .catch((err) => { console.log(err);})
        
      }
    }, (error) => {
      console.log(error);
    }).finally(() => {
      this.setState({isLoading: false});
    });
  }

  
  render() {
    
    const { isLoading, isLoggedIn, user, peer, token, connections, online, selectedUser, messages, userProfiles, userSettings } = this.state; 
    
    let selectedUserPeerID: string|false = false;
    if (selectedUser) selectedUserPeerID = (exists(online[selectedUser.username]) ? online[selectedUser.username].peerID : false);

    if (isLoading) return (<div>Loading...</div>);
    else return (
      <Box className="App">
        <Provider store={this.store} >
          <Router>
            <Switch>
              <Route path="/login">
                {isLoggedIn ? <Redirect to="/" /> : <LoginForm />}
              </Route>
              <Route path="/signup">
                {isLoggedIn ? <Redirect to="/" /> : <RegisterForm />}
              </Route>
              <Route exact path="/">
                {!isLoggedIn || !token || !user || !peer ? <Redirect to="/login" /> : 
                <>
                  <Box className='header'>
                    <AppHeader
                      userProfiles={userProfiles}
                      token={token} 
                      peer={peer} 
                      messages={messages} 
                      selectedUser={selectedUser} 
                      connections={connections} 
                      online={online} 
                      user={user}
                      userSettings={userSettings}
                      db={this.db} 
                    />
                  </Box>
                  <Box className='wrapper'>
                    <Box className={'conversation-area'}>
                      <ConnectionsList 
                        key={`${JSON.stringify(messages)}`} 
                        userProfiles={userProfiles}
                        messages={messages} 
                        selectedUser={selectedUser} 
                        connections={connections} 
                        online={online} 
                        token={token} 
                        user={user} 
                        db={this.db} 
                      />
                      <OnlineList 
                        online={online} 
                        user={user} 
                        db={this.db} 
                      />
                    </Box>
                    <Box className='chat-area'>
                    { selectedUser ? 
                      <>
                      <Box className='chat-area-header'>
                        <ChatHeader 
                          isOnline={exists(online[selectedUser.username])} 
                          selectedUser={selectedUser} 
                          selectedUserProfile={exists(userProfiles[selectedUser.username]) ? userProfiles[selectedUser.username]: false}
                        />
                      </Box>
                      <Box className='chat-area-main chat-area-width'>
                        <MessagesDisplay 
                          db={this.db}
                          messages={exists(messages[selectedUser.username]) ? messages[selectedUser.username] : []}
                          localUsername={user.username}
                          remoteUsername={selectedUser.username}
                          localProfile={(exists(userProfiles[user.username]) ? userProfiles[user.username] : false)}
                          remoteProfile={(exists(userProfiles[selectedUser.username]) ? userProfiles[selectedUser.username] : false)}
                        />
                      </Box>
                      <Box className='chat-area-footer chat-area-width'>
                        <Messenger
                          key={`connectto${selectedUser.username}${selectedUserPeerID}`}
                          remotePeerID={selectedUserPeerID}
                          peer={peer}
                          systemUser={user} 
                          selectedUser={selectedUser}
                          userProfile={(exists(userProfiles[user.username]) ? userProfiles[user.username] : false)}
                          db={this.db}
                        />
                      </Box> 
                      </>
                    : <></>}
                    </Box>
                  </Box>
                </>
                }
              </Route>          
              <Route path="*"><Redirect to="/" /></Route> 
            </Switch>
          </Router>
        </Provider>
      </Box>
    );

  }
}

export default App;