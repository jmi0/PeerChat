import React, { useState, useEffect, Component } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Peer, { DataConnection } from 'peerjs';
import Dexie from 'dexie';

import { User } from './App.config';
import { exists } from './App.fn';
import reducer from './reducers';
import { UpdateSystemUser } from './actions';

import LoginForm from './components/Login';
import ConnectionsList from './components/Connections';
import Messenger from './components/Messenger';
import PeerBar from './components/PeerBar';

import { Box } from '@material-ui/core';
import "./style/App.scss";
import './style/Chat.scss';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'


const store = configureStore({reducer: reducer});

const App: React.FC = (props: any) => {
  

  const [ isLoggedIn, setIsLoggedIn ] = useState<boolean>(false);
  const [ token, setToken ] = useState<string|false>(false);
  const [ peer, setPeer ] = useState<Peer|false>(false);
  const [ user, setUser ] = useState<User|false>(false);
  const [ connections, setConnections ] = useState<{[key: string]:DataConnection|false}>({});
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  
  useEffect(() => {

    if ((!peer || peer?.destroyed) && isLoggedIn) {
      setPeer(new Peer({
        host: window.location.hostname,
        port: 9000, 
        path: '/peerserver'
      }));
    }
    
    const unsubscribe = store.subscribe(() => {
      const { system, chat } = store.getState();
      setIsLoggedIn(system.isLoggedIn);
      setToken(system.token);
      setUser(system.user);
    });
    
    
    // try to refresh token
    fetch('/refreshtoken', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.json())
    .then((result) => {
      if (exists(result.username)) {
        store.dispatch(UpdateSystemUser(
          {username: result.username, peerID: ''},
          true,
          false,
          result.token
        ));
      }
    }, (error) => {
      
      console.log(error);
    }).finally(() => {
      setIsLoading(false);
    });
    
    return () => {
      //  on unmount
      if (peer) peer.destroy();
      unsubscribe();
    }

  }, [peer, isLoggedIn]);

  if (isLoading) return (<div>Loading...</div>);
  else
    return (
      <Box className="App">
        <Provider store={store} >
          {!isLoggedIn || !token || !user || !peer ? <LoginForm /> : 
          <>
            <Box className='header'>
              <PeerBar token={token} peer={peer} />
            </Box>
            <Box className='wrapper'>
              <Box className={'conversation-area'}>
                <ConnectionsList connections={{}} token={token} user={user} />
              </Box>
              <Box className='chat-area'>
                <Box className='chat-area-header'></Box>
                <Box className='chat-area-main'></Box>
                <Box className='chat-area-footer'>
                  <Messenger peer={peer} systemUser={user} selectedUser={{username:'', peerID:''}} />
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
