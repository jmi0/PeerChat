import React, { useState } from 'react';
import { connect } from 'react-redux';
import Peer, { DataConnection } from 'peerjs';

import { Button, AppBar, Toolbar, IconButton, Typography, MenuItem, Menu, Drawer } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'

import { UserLogout } from '../actions';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

type PeerBarProps = {
  token: string,
  peer: Peer,
  dispatch: any
}


const AppHeader: React.FC<PeerBarProps> = (props: PeerBarProps) => {

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const profileDrawerOpen = Boolean(profileAnchorEl);
  const settingsDrawerOpen = Boolean(settingsAnchorEl);

  const logout = () => {
    fetch('/logout', { method: 'POST', headers: {'Content-Type': 'application/json'}})
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.error(err);
    }).finally(() => {
      props.dispatch(UserLogout());
    });
  }

  const openProfileDrawer = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const openSettingsDrawer = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const closeDrawers = (event: React.KeyboardEvent | React.MouseEvent) => {
    
    if (
      event.type === 'keydown' && (
        (event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift'
      )
    ) return;
    
    setProfileAnchorEl(null);
    setSettingsAnchorEl(null);
  };


  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">p2pChat</Typography>
        <Button color="inherit" onClick={logout} >Logout</Button>
      
          <IconButton
            aria-label="profile form of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={openProfileDrawer}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <IconButton
            aria-label="settings form"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={openSettingsDrawer}
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>
        
      </Toolbar>
      <Drawer anchor={'right'} open={profileDrawerOpen} onClose={closeDrawers}>
        <div>profile form</div>
      </Drawer>
      <Drawer anchor={'right'} open={settingsDrawerOpen} onClose={closeDrawers}>
        <div>setting form</div>
      </Drawer>
    </AppBar>      
  );

}

export default connect()(AppHeader);
