/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 11:08:23 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:36:45
 */

import React from 'react';
import { connect } from 'react-redux';

import { ChatHeaderProps } from '../App.config'

import { Avatar, Badge, Box, Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";


// Styles for online badge
// TODO: pull all materialUI makeStyles to separate file
const useStyles = makeStyles({
  onlineBadge: { backgroundColor: "green", margin: 0,}
});


/**
 * Displays current selected user avatar and information, online/offline state
 * 
 * @param props : ChatHeaderProps
 */
const ChatHeader: React.FC<ChatHeaderProps> = (props: ChatHeaderProps) => {

  const classes = useStyles();

  /**
   * gets/creates the correct avatar based on whats available - profile pic, online/offline state
   * TODO: will probably add additional profile information here - headline, name, etc...
   */
  const getAvatar = () => {
    let profilepic : string = '';
    if (props.selectedUserProfile && typeof props.selectedUserProfile.profilepic === 'string') profilepic = props.selectedUserProfile.profilepic;
    if (profilepic.length) return (<Avatar><img alt={`avatar`} width={'100%'} src={profilepic}></img></Avatar>);
    else return (<Avatar>{props.selectedUser.username.charAt(0)}</Avatar>);
  }

  return (
    <>
    {props.selectedUser ? 
      <Box display={"flex"} alignItems={"flex-start"}>
        <Box>
        {props.isOnline ? 
          <Badge overlap="circle" classes={{badge: classes.onlineBadge}} variant="dot">{getAvatar()}</Badge> : 
          <>{getAvatar()}</>
        }
        </Box>
        <Box pl={2} ><Typography variant={'h5'}>{props.selectedUser.username}</Typography><Box fontSize={12}>{props.isOnline ? 'Online' : 'Offline'}</Box></Box>
      </Box> : <></>
    }
    </>
  );

}

export default connect()(ChatHeader);
