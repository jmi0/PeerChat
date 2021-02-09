import React, { useState, useEffect, Component } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Peer, { DataConnection } from 'peerjs';
import Dexie from 'dexie';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import { User, Connections, SystemState, ChatStoreState, Messages, Message, UserProfiles, UserProfile, UserSettings } from './App.config';
import { exists, refreshFetch } from './App.fn';
import reducer from './reducers';
import { UpdateBulkUserProfiles, updateOnline, UpdateSystemUser, updateMessages, UpdateBulkConnections, UpdateConnections, UpdateUserProfiles, updateToken, UpdateUserSettings } from './actions';

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

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'
import { profile } from 'console';



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


class App extends Component<any, AppState> {

  discoveryInterval: number = 0;
  store = configureStore({reducer: reducer});
  db: Dexie = new Dexie('p2pchat');
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
    
    this.db.version(1).stores({
      messages: '++id, seen, timestamp, from, to, sent, text, groupkey',
      user_profiles: '&username, firstname, lastname, bio, headline',
      user_connections: '&username',
      user_settings: '&username'
    });

    this.init();

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

    this.getRemotePeers();
    this.discoveryInterval = window.setInterval(() => {
      this.getRemotePeers();
    }, 1000);

  }
  
  componentWillUnmount() {
    if (this.state.peer) this.state.peer.destroy();
    clearInterval(this.discoveryInterval);
    this.unsubscribe();
    this.db.close();
  }

  getRemotePeers() {
    
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${this.state.token}`);
    refreshFetch('/peers', 'GET', headers, null)
    .then((result: any) => {
      // if token set then just update token
      if (exists(result.token)) this.store.dispatch(updateToken(result.token));
      else this.store.dispatch(updateOnline(result));
    })
    .catch((err) => {
      console.log(err);
    })

  }

  setUpPeer(token: string) : Peer {

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
        if (exists(data.message)) {
          // handle message
          data.message.groupkey = `${data.message.to}-${data.message.from}`;
          if (this.state.selectedUser && this.state.selectedUser.username === data.message.from) data.message.seen = true;
          this.db.table('messages').add(data.message)
          .then((id) => { console.log(`Message added to IndexedDB`); })
          .catch((err) => { console.error(`Could not add message to IndexedDB: ${err}`); })
          .finally(() => {
            this.store.dispatch(updateMessages(data.message.from, data.message));
            if (!exists(this.state.connections[data.message.from])) this.store.dispatch(UpdateConnections({username: data.message.from, peerID: conn.peer}));
          });
        }
        else if (exists(data.user_profile)) {
          // handle user profile
          this.db.table('user_profiles').put(data.user_profile)
          .then((id) => { console.log(`Updated user profile for ${data.user_profile.username} in IndexedDB`) })
          .catch((err) => { console.log(`Could not store user profile ${err}`); })
          .finally(() => { this.store.dispatch(UpdateUserProfiles(data.user_profile)); });

          // send any unsent messages back to this user
          if (this.state.user) {
            
            this.db.table('messages').where('from').equals(`${this.state.user.username}`).sortBy('timestamp')
            .then(messages => {
              messages.forEach((message) => {
                if (message.sent) return;
                if (message.to !== data.user_profile.username) return;
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
      console.log(err);
      console.log(`ERROR: ${err.message}`);
    });

    return peer;
  }

  updateUserPeerID(peerid: string, token: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    refreshFetch('/updatepeerid', 'POST', headers, JSON.stringify({peerid:peerid}))
    .then((result: any) => {
      if (exists(result.token)) this.setState({token:result.token});
    })
    .catch((err) => {
      console.log(err);
    });
  }

  init() {
    // try to refresh token
    fetch('/refreshtoken', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.json())
    .then((result) => {
      if (exists(result.username)) {

        this.setState({ peer: this.setUpPeer(result.token)}, () => {
          this.store.dispatch(UpdateSystemUser(
            {username: result.username, peerID: ''}, 
            true, 
            false, 
            result.token
          ));
        });

        this.db.table('user_connections').where('username').equals(result.username)
        .first((user_connections) => {
          if (typeof user_connections !== 'undefined') 
            this.store.dispatch(UpdateBulkConnections(JSON.parse(user_connections.connections)));
        }).catch((err) => { console.log(err); });

        this.db.table('user_profiles').toArray()
        .then((user_profiles: Array<UserProfile>) => {
          if (user_profiles.length) 
            user_profiles.forEach((user_profile: UserProfile) => {
              this.store.dispatch(UpdateUserProfiles(user_profile));
            });
          else {
            // create empty profile
            this.db.table('user_profiles').put({username: result.username})
            .then((id) => {
              this.store.dispatch(UpdateUserProfiles({username: result.username}));
            })
            .catch((err) => { console.log(`Could create empty profile: ${err}`); });
          }
        }).catch((err) => { console.log(err); });

        this.db.table('user_profiles').where('username').equals(result.username)
        .first((user_profile) => {
          if (typeof user_profile !== 'undefined') this.store.dispatch(UpdateUserProfiles(user_profile));
          else this.db.table('user_profiles').put({username: result.username})
            .then((id) => {
              console.log(`Created user profile for ${result.username}`);
              this.store.dispatch(UpdateUserProfiles({username: result.username}));
            })
            .catch((err) => { console.log(err) });
        })
        .catch((err) => { console.log(err); })

        this.db.table('user_settings').where('username').equals(result.username)
        .first((user_settings) => {
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