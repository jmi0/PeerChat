import React, { useState, useEffect, Component } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Peer, { DataConnection } from 'peerjs';
import Dexie from 'dexie';


import { User, Connections, SystemState, ChatStoreState, Messages, Message } from './App.config';
import { exists, refreshFetch } from './App.fn';
import reducer from './reducers';
import { UpdateSystemUser, updateMessages, UpdateBulkConnections, UpdateConnections } from './actions';

import LoginForm from './components/Login';
import DiscoveryList from './components/Discovery';
import ConnectionsList from './components/Connections';
import Messenger from './components/Messenger';
import PeerBar from './components/PeerBar';
import MessagesDisplay from './components/Messages';
import ChatHeader from './components/ChatHeader'

import { Box } from '@material-ui/core';
import "./style/App.scss";
import './style/Chat.scss';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'



type AppState = {
  isLoading: boolean,
  isLoggedIn: boolean,
  user: User|false,
  token: string|false,
  peer: Peer|false,
  messages: Messages,
  online: Connections,
  connections: Connections,
  selectedUser: User|false
}


class App extends Component<any, AppState> {

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
      selectedUser: false
    }

  }
  
  componentDidMount() {
    
    this.db.version(1).stores({
      messages: '++id, sent, seen, timestamp, from, to, text, image, attachment, groupkey',
      user_connections: '&username, connections',
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
        online: chat.online
      });      

    });

  }
  
  componentWillUnmount() {
    if (this.state.peer) this.state.peer.destroy();
    this.unsubscribe();
    this.db.close();
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
        data.message.groupkey = `${data.message.to}-${data.message.from}`;
        this.db.table('messages').add(data.message).then((id) => {
          console.log(`Message added to IndexedDB`);
        }).catch((err) => {
          console.error(`Could not add message to IndexedDB: ${err}`);
        }).finally(() => {
          this.store.dispatch(updateMessages(data.message.from, data.message));
          if (!exists(this.state.connections[data.message.from])) this.store.dispatch(UpdateConnections({username: data.message.from, peerID: conn.peer}));
        });
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
        
      }
    }, (error) => {
      console.log(error);
    }).finally(() => {
      this.setState({isLoading: false});
    });
  }

  
  render() {
    
    const { isLoading, isLoggedIn, user, peer, token, connections, online, selectedUser, messages } = this.state; 
    
    let selectedUserPeerID: string|false = false;
    if (selectedUser) selectedUserPeerID = (exists(online[selectedUser.username]) ? online[selectedUser.username].peerID : false);

    if (isLoading) return (<div>Loading...</div>);
    else return (
      <Box className="App">
        <Provider store={this.store} >
          {!isLoggedIn || !token || !user || !peer ? <LoginForm /> : 
          <>
            <Box className='header'>
              <PeerBar token={token} peer={peer} />
            </Box>
            <Box className='wrapper'>
              <Box className={'conversation-area'}>
                <ConnectionsList messages={messages} selectedUser={selectedUser} connections={connections} online={online} token={token} user={user} db={this.db} />
                <DiscoveryList token={token} user={user} db={this.db} />
              </Box>
              <Box className='chat-area'>
              { selectedUser ? 
                <>
                <Box className='chat-area-header'>
                  <ChatHeader isOnline={exists(online[selectedUser.username])} selectedUser={selectedUser} />
                </Box>
                <Box className='chat-area-main'>
                  <MessagesDisplay 
                    db={this.db}
                    messages={exists(messages[selectedUser.username]) ? messages[selectedUser.username] : []}
                    localUsername={user.username}
                    remoteUsername={selectedUser.username}
                    lastMessage={exists(messages[selectedUser.username]) ? messages[selectedUser.username][messages[selectedUser.username].length-1] : {}}
                  />
                </Box>
                <Box className='chat-area-footer'>
                  <Messenger
                    key={`connectto${selectedUser.username}${selectedUserPeerID}`}
                    remotePeerID={selectedUserPeerID}
                    peer={peer}
                    systemUser={user} 
                    selectedUser={selectedUser}
                    db={this.db}
                  />
                </Box> 
                </>
              : <></>}
              </Box>
            </Box>
          </>
          }
        </Provider>
      </Box>
    );

  }
}

export default App;