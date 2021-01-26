import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Peer, { DataConnection } from 'peerjs';


import { refreshFetch, exists } from '../App.fn';


import { Button, AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';


import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'

import { UpdateSystemUser } from '../actions';



type PeerBarProps = {
  token: string,
  peer: Peer,
  dispatch: any
}




const PeerBar: React.FC<PeerBarProps> = (props: PeerBarProps) => {
  console.log(props.peer);
  const [ token, setToken ] = useState<string>(props.token);
  const [ peer, setPeer ] = useState<Peer>(props.peer);

  
  const logout = () => {
    fetch('/logout', { method: 'POST', headers: {'Content-Type': 'application/json'}})
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.error(err);
    }).finally(() => {
      props.dispatch(UpdateSystemUser(false, false, false, false));
    });
  }


  const setUpPeer = (peer: Peer) => {
    
    // get local peer id from peer server
    peer.on('open', (peerid) => {
      // set this users peerid
      updateUserPeerID(peerid);
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

  };

  const updateUserPeerID = (peerid: string) => {
    
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    refreshFetch('/updatepeerid', 'POST', headers, JSON.stringify({ peerid: peerid }))
    .then((result: any) => {
      if (exists(result.token)) setToken(result.token);
    })
    .catch((err) => {if (peer) peer.destroy();});
  }
  
  useEffect(() => {
    
    setUpPeer(props.peer);
    

    return () => {
      //  on unmount
      peer.destroy();
 
    }

  }, []);

  console.log('render');
  return (
     
              <AppBar position="static" elevation={0}>
                <Toolbar>
                  <IconButton edge="start" color="inherit" aria-label="menu">
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6">p2pChat</Typography>
                  <Button color="inherit" onClick={logout} >Logout</Button>
                </Toolbar>
              </AppBar>
          
  );

}

export default connect()(PeerBar);
