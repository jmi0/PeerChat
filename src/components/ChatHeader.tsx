import React from 'react';
import { connect } from 'react-redux';

import { User } from '../App.config'
import { exists } from '../App.fn';
import { Avatar, Badge, Box, Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'
import { start } from 'repl';

const useStyles = makeStyles({
  onlineBadge: {
    backgroundColor: "green",
    margin: 0,
  }
});

type ChatHeaderProps = {
  selectedUser: User|false,
  isOnline: boolean,
  dispatch: any
}


const ChatHeader: React.FC<ChatHeaderProps> = (props: ChatHeaderProps) => {

  const classes = useStyles();

  return (
    <>
    {props.selectedUser ? 
      <Box display={"flex"} alignItems={"flex-start"}>
        <Box>
        {props.isOnline ? 
          <Badge overlap="circle" classes={{badge: classes.onlineBadge}} variant="dot"><Avatar>{props.selectedUser.username.charAt(0)}</Avatar></Badge>: 
          <Avatar>{props.selectedUser.username.charAt(0)}</Avatar>
        }
        </Box>
        <Box pl={2} ><Typography variant={'h5'}>{props.selectedUser.username}</Typography><Box fontSize={12}>{props.isOnline ? 'Online' : 'Offline'}</Box></Box>
      </Box> : <></>
    }
    </>
  );

}

export default connect()(ChatHeader);
