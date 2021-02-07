import React, { useState } from 'react';
import { connect } from 'react-redux';
import Peer, { DataConnection } from 'peerjs';

import ConnectionsList from './Connections';
import OnlineList from './Online';
import ProfileForm from './ProfileForm'
import SettingsForm from './SettingsForm'

import { Button, AppBar, Toolbar, IconButton, Typography, MenuItem, Menu, Drawer, Box, TextField} from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'
import { User, Connections, Messages, UserProfiles } from '../App.config'
import { UserLogout } from '../actions';
import Dexie from 'dexie'

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    
  },
  title: {
    
  },
  drawerBox: {
    width: '340px'
  },
  drawerPadding: {
    padding: '0px 10px 0px 10px'
  },
  right: {
    float: 'right'
  }
}));

type PeerBarProps = {
  token: string,
  peer: Peer,
  user: User,
  userProfiles: UserProfiles,
  selectedUser: User|false,
  connections: Connections,
  online: Connections,
  messages: Messages,
  db: Dexie,
  dispatch: any
}


const AppHeader: React.FC<PeerBarProps> = (props: PeerBarProps) => {

  const classes = useStyles();

  const [ profileAnchorEl, setProfileAnchorEl ] = useState<null | HTMLElement>(null);
  const [ settingsAnchorEl, setSettingsAnchorEl ] = useState<null | HTMLElement>(null);
  const [ connectionsAnchorEl, setConnectionsAnchorEl ] = useState<null | HTMLElement>(null);
  const profileDrawerOpen = Boolean(profileAnchorEl);
  const settingsDrawerOpen = Boolean(settingsAnchorEl);
  const connectionsDrawerOpen = Boolean(connectionsAnchorEl);

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

  const openConnectionsDrawer = (event: React.MouseEvent<HTMLElement>) => {
    setConnectionsAnchorEl(event.currentTarget);
  };

  const openProfileDrawer = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const openSettingsDrawer = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
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
    setConnectionsAnchorEl(null);
  };


  return (
    <div className={classes.grow}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton 
            className={'connectionsDrawerButton'}
            edge="start" 
            color="inherit" 
            aria-label="menu"
            onClick={openConnectionsDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} noWrap>PeerChat</Typography>
          <div className={classes.grow}></div>
          <IconButton
            className={classes.menuButton}
            aria-label="profile form of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={openProfileDrawer}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <IconButton
            className={classes.menuButton}
            aria-label="settings form"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={openSettingsDrawer}
            color="inherit"
            edge="end"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
        <Drawer anchor={'left'} open={connectionsDrawerOpen} onClose={closeDrawers}>
          <Box className={classes.drawerBox}>
            <ConnectionsList 
              key={`${JSON.stringify(props.messages)}`} 
              userProfiles={props.userProfiles}
              messages={props.messages} 
              selectedUser={props.selectedUser} 
              connections={props.connections} 
              online={props.online} 
              token={props.token} 
              user={props.user} 
              db={props.db} 
            />
            <OnlineList 
              online={props.online} 
              user={props.user} 
              db={props.db} 
            />
          </Box>
        </Drawer>
        <Drawer anchor={'right'} open={profileDrawerOpen} onClose={closeDrawers}>
          <Box><IconButton className={classes.right} onClick={closeDrawers}><CloseIcon /></IconButton></Box>
          <Box className={`${classes.drawerBox} ${classes.drawerPadding}`}>
            <ProfileForm user={props.user} profile={props.userProfiles[props.user.username]} db={props.db} />
            <hr />
            <Button color="inherit" className={classes.right} onClick={logout} >Logout</Button>
          </Box>
        </Drawer>
        <Drawer anchor={'right'} open={settingsDrawerOpen} onClose={closeDrawers}>
          <Box><IconButton className={classes.right} onClick={closeDrawers}><CloseIcon /></IconButton></Box>
          <Box className={`${classes.drawerBox} ${classes.drawerPadding}`}>
            <SettingsForm />
          </Box>
        </Drawer>
      </AppBar> 
    </div>     
  );

}

export default connect()(AppHeader);
