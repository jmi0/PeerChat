import React from 'react';
import { connect } from 'react-redux';

import { User, UserProfile } from '../App.config'

import { Avatar, Badge, Box, Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles({
  onlineBadge: {
    backgroundColor: "green",
    margin: 0,
  }
});

type ChatHeaderProps = {
  selectedUser: User,
  selectedUserProfile: UserProfile|false
  isOnline: boolean,
  dispatch: any
}


const ChatHeader: React.FC<ChatHeaderProps> = (props: ChatHeaderProps) => {

  const classes = useStyles();

  const getAvatar = () => {
    let profilepic : string = '';
    if (props.selectedUserProfile && typeof props.selectedUserProfile.profilepic === 'string') profilepic = props.selectedUserProfile.profilepic;
    if (profilepic.length) return (<Avatar><img width={'100%'} src={profilepic}></img></Avatar>);
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
