import React from 'react';
import { connect } from 'react-redux';
import Peer, { DataConnection } from 'peerjs';

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
