import React from 'react';
import { connect } from 'react-redux';
import Peer, { DataConnection } from 'peerjs';

import { Button, AppBar, Toolbar, IconButton, Typography, MenuItem, Menu } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
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

  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const profileMenuRef = React.useRef();
  const open = Boolean(anchorEl);

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

  const handleMenu = (event: React.MouseEvent) => {
    setAnchorEl(profileMenuRef.current);
    console.log(profileMenuRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">p2pChat</Typography>
        <Button color="inherit" onClick={logout} >Logout</Button>
        <div>
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>      
  );

}

export default connect()(AppHeader);
