import React, { useState, useEffect } from 'react';
import { Provider, connect } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dexie from 'dexie';
import Peer, { DataConnection } from 'peerjs';

import { User, Connections, Messages } from './App.config';
import reducer from './reducers';

import LoginForm from './components/Login';
import Chat from './components/Chat';
import ConnectionsList from './components/Connections';
import Messenger from './components/Messenger';

import { Box, Button, AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import "./style/App.scss";
import './style/Chat.scss';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'

import { updateLoginState, UpdateSystemUser, updateToken } from './actions';


const db = new Dexie('test');

const store = configureStore({reducer: reducer});

const peer = new Peer({
  host: window.location.hostname,
  port: 9000, 
  path: '/peerserver'
});


const App: React.FC = (props: any) => {

  const [ isLoggedIn, setIsLoggedIn ] = useState<boolean>(false);
  const [ token, setToken ] = useState<string|false>(false);
  const [ user, setUser ] = useState<User|false>(false);
  const [ peerID, setPeerID ] = useState<string|false>(false);
  const [ connections, setConnections ] = useState<{[key: string]:DataConnection|false}>({});
  const [ isLoading, setIsLoading ] = useState<boolean>(true);

  
  let messages: Messages = {};
  let online: {[key: string]: User} = {};
  
  const logout = () => {
    fetch('/logout', { method: 'POST', headers: {'Content-Type': 'application/json'}})
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.error(err);
    }).finally(() => {
      setIsLoggedIn(false);
      setToken(false);
      setUser(false);
    });
  }
  
  useEffect(() => {

    

    // get local peer id from peer server
    peer.on('open', (peerid) => {
      // set this users peerid
      console.log(`My peer ID is ${peerid}`);
      
      
    });
    // listen for connections
    peer.on('connection', (conn) => {
      // message receiver
      conn.on('data', (data) => {
        console.log(`${conn.peer}:`, data);
      });
      // connection receiver
      conn.on('open', () => {
        // connected
        console.log(`Connected: ${conn.peer}`);
      });
    });
    peer.on('disconnected', () => {
      console.log('disconnected');
    });
    peer.on('error', (err) => {
      console.log(`ERROR: ${err.message}`);
    });


    store.subscribe(() => {
      const { system, chat } = store.getState();
      setIsLoggedIn(system.isLoggedIn);
      setToken(system.token);
      setUser(system.user);
      console.log('subscribe',system);
    });
    
    
    // try to refresh token
    fetch('/refreshtoken', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.json())
    .then((result) => {
      if (typeof result.username !== 'undefined') {
        store.dispatch(updateLoginState(true));
        store.dispatch(updateToken(result.token));
        store.dispatch(UpdateSystemUser({username: result.username, peerID: ''}));
      }
    }, (error) => {
      
      console.log(error);
    }).finally(() => {
      setIsLoading(false);
    });


    

    return () => {
      //  on unmount
      
    }

  }, []);
  

  



  console.log('render');
  if (isLoading) return (<div>Loading...</div>);
  else
    return (
      <Box className="App">
        <Provider store={store} >
          {!isLoggedIn || !token || !user ? <LoginForm /> : 
          <>
            <Box className='header'>
              <AppBar position="static" elevation={0}>
                <Toolbar>
                  <IconButton edge="start" color="inherit" aria-label="menu">
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6">p2pChat</Typography>
                  <Button color="inherit" onClick={logout} >Logout</Button>
                </Toolbar>
              </AppBar>
            </Box>
            <Box className='wrapper'>
              <Box className={'conversation-area'}>
                <ConnectionsList connections={connections} token={token} />
              </Box>
              <Box className='chat-area'>
                <Box className='chat-area-header'></Box>
                <Box className='chat-area-main'></Box>
                <Box className='chat-area-footer'>
                  <Messenger connection={false} systemUser={user} selectedUser={{username:'', peerID:''}} />
                </Box>
              </Box>
            </Box>
          </>
          }
        </Provider>
      </Box>
    );

}

export default App;
