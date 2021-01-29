import React, { useState, useEffect, Component } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Peer, { DataConnection } from 'peerjs';
import Dexie from 'dexie';

import { User, Connections, SystemState, ChatStoreState } from './App.config';
import { exists, refreshFetch } from './App.fn';
import reducer from './reducers';
import { UpdateSystemUser } from './actions';

import LoginForm from './components/Login';
import ConnectionsList from './components/Connections';
import Messenger from './components/Messenger';
import PeerBar from './components/PeerBar';
import MessagesDisplay from './components/Messages'

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
  connections: Connections,
  selectedUser: User|false
}


class App extends Component<any, AppState> {

  store = configureStore({reducer: reducer});
  unsubscribe: any;

  constructor(props: any) {
    
    super(props);
    
    this.state = {
      isLoading: true,
      isLoggedIn: false,
      user: false,
      token: false,
      peer: false,
      connections: {},
      selectedUser: false
    }

  }
  
  componentDidMount() {
    
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
        selectedUser: chat.selectedUser
      });      

    });

  }
  

  componentWillUnmount() {
    if (this.state.peer) this.state.peer.destroy();
    this.unsubscribe();
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
        console.log(data);
      });
      
      // connection receiver
      conn.on('open', () => {
        // connected
        console.log('Connected',conn);
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
        
      }
    }, (error) => {
      console.log(error);
    }).finally(() => {
      this.setState({isLoading: false});
    });
  }

  updateConnections(username: string, conn: DataConnection) {
    let connections = this.state.connections;
    connections[username] = conn;
    this.setState({ connections: connections });
  }

  connectToPeer(user: User) : DataConnection|false {

    if (!this.state.peer) return false;
    
    if (
      exists(this.state.connections[user.username]) && 
      this.state.connections[user.username] && 
      this.state.connections[user.username].open
    ) return false;

    let conn = this.state.peer.connect(user.peerID, {serialization: 'json'});
    
    if (!conn) return false;
    
    conn.on('open', () => {
      console.log(`Connected to ${user.username}`);
      //this.updateConnections(user.username, conn);
    });

    conn.on('data', (data) => {
      console.log(data);
    });
 
    const self = this;
    conn.on('error', function(err) {
      console.log(err);
    });

    conn.on('disconnected', () => {
      console.log(`Disconnected from ${user.username}`);
    });

    return conn;
    
  }

  
  render() {
    
    const { isLoading, isLoggedIn, user, peer, token, connections, selectedUser } = this.state; 
      
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
                <ConnectionsList connections={connections} token={token} user={user} />
              </Box>
              <Box className='chat-area'>
              { selectedUser ? 
                <>
                <Box className='chat-area-header'></Box>
                <Box className='chat-area-main'>
                  <MessagesDisplay 
                    messages={[]}
                    localUsername={user.username}
                    remoteUsername={selectedUser.username}
                    lastMessage={{}}
                  />
                </Box>
                <Box className='chat-area-footer'>
                  <Messenger 
                    connection={this.connectToPeer(selectedUser)} 
                    systemUser={user} 
                    selectedUser={selectedUser} 
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