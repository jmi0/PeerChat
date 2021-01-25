import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import reducer from './reducers';
import { User, Connections, Messages } from './App.config';
import LoginForm from './components/Login';
import Chat from './components/Chat';
import { Box, Button, AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import "./style/App.scss";


const App: React.FC = (props: any) => {

  const [ isLoggedIn, setIsLoggedIn ] = useState<boolean>(false);
  const [ token, setToken ] = useState<string|false>(false);
  const [ user, setUser ] = useState<User|false>(false);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  let connections: Connections = {};
  let messages: Messages = {};
  let online: {[key: string]: User} = {};

  const store = configureStore({reducer: reducer});
  
  store.subscribe(() => {
    const { chat, system } = store.getState();
    setIsLoggedIn(system.isLoggedIn);
    setToken(system.token);
    setUser(system.user);
    console.log(system);
  });

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
    setIsLoading(true);
    // try to refresh token
    fetch('/refreshtoken', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.json())
    .then((result) => {
      setIsLoading(false);
      if (typeof result.username !== 'undefined') {
        setIsLoggedIn(true);
        setToken(result.token);
        setUser({username: result.username, peerID:''});
      }
    }, (error) => {
      setIsLoading(false);
      console.log(error);
    });

    return () => {
      // unsubscribe on unmount
      
    }
    
  }, []);

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
              <Chat user={user} token={token} />
            </Box>
          </>
          }
        </Provider>
      </Box>
    );

}

export default App;
