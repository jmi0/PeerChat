import React, { useEffect } from 'react'
import { connect } from 'react-redux';
import Dexie from 'dexie'

import { Connections, User, Messages, Message, UserProfiles } from '../App.config';
import { exists } from '../App.fn';
import { UpdateBulkMessages, UpdateSelectedUser } from '../actions';

import { Box, List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Avatar, Badge } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles({
  onlineBadge: {
    backgroundColor: "green",
    margin: 0,
  }
});


type ConnectionsProps = {
  user: User,
  selectedUser: User|false,
  userProfiles: UserProfiles,
  connections: Connections,
  online: Connections,
  messages: Messages,
  token: string,
  db: Dexie,
  dispatch: any
}

const ConnectionsList: React.FC<ConnectionsProps> = (props: ConnectionsProps) => {
  
  const classes = useStyles();

  useEffect(() => {

    if (Object.keys(props.connections).length) {
      // update connections in db
      props.db.table('user_connections').update(props.user.username, {connections: JSON.stringify(props.connections)})
      .then(function (updated) {
        if (!updated) props.db.table('user_connections').put({username: props.user.username, connections: JSON.stringify(props.connections)})
          .then((id) => { console.log(`Created entry in user_connections: ${id}`); })
          .catch((err) => { console.log(err);})
      });

      // get messages for all connections
      Object.keys(props.connections).forEach((username) => {
        props.db.table('messages').where('groupkey').equals(`${props.user.username}-${username}`).sortBy('timestamp')
        .then(messages => {
          props.dispatch(UpdateBulkMessages(username, messages));
        })
        .catch((err) => { console.log(err); });
      });

    }

    return () => {
      
      
    }

  }, [props.connections]);


  const handleSelectedPeerChange = (event: React.MouseEvent, peer: User) => {
    props.dispatch(UpdateBulkMessages(peer.username, props.messages[peer.username].map((message: Message) => {
      // update seen state in db and redux store  
      if (!message.seen && message.to === props.user.username) {
        props.db.table('messages').update(message.id, {seen: true}).then((updated) => {
          if (!updated) console.log(`Could not update ${message.id}`);
        });
      }
      return {...message, seen:true};
    })));
    props.dispatch(UpdateSelectedUser(peer));
  }

  const getAvatar = (username: string) => {
    let avatar = <Avatar>{username.charAt(0)}</Avatar>;
    if (!exists(props.userProfiles[username])) return avatar;
    if (typeof props.userProfiles[username].profilepic !== 'string') return avatar;
    if (props.userProfiles[username].profilepic === '') return avatar;
    return (<Avatar><img alt={`${username}-avatar`} width={'100%'} src={props.userProfiles[username].profilepic}></img></Avatar>);
  }
  
  
  return (
    <List key={JSON.stringify(Object.keys(props.connections))} disablePadding>
      
      {Object.keys(props.connections).map((username: string, index: number) => {

        if (props.connections[username].username === props.user.username) return <></>;
        
        var unreadCount: number = 0;
        var lastMessageDisplay: string = '';
        if (exists(props.messages[username])) {
          props.messages[username].forEach((message) => { if (!message.seen && message.to === props.user.username) unreadCount++; });
          if (props.messages[username].length) {
            let lastMessage = props.messages[username][props.messages[username].length-1];
            if (lastMessage.text) lastMessageDisplay = lastMessage.text.substring(0, 15);
            else if (lastMessage.image) lastMessageDisplay = 'image attachment';
            else if (lastMessage.attachment) lastMessageDisplay = 'attachment';
            if (lastMessageDisplay.length === 15) lastMessageDisplay += ' ...';
          }
        }
        
        return (
          <ListItem key={`${JSON.stringify(props.connections[username])}-connection-${index}`} button selected={(props.selectedUser ? props.selectedUser.username : '') === props.connections[username].username} onClick={(event) => handleSelectedPeerChange(event, props.connections[username])}>
            {(exists(props.connections[username])) ? 
              <>
              <ListItemIcon>
                <ListItemAvatar>
                  {exists(props.online[username]) ? 
                    <Badge color={'secondary'} overlap="circle" classes={{badge: classes.onlineBadge}} variant="dot">{getAvatar(username)}</Badge>: 
                    <>{getAvatar(username)}</>
                  }
                </ListItemAvatar>
              </ListItemIcon>
              <ListItemText primary={props.connections[username].username} />
              <Box className={'lastMessagePreview'}>{lastMessageDisplay}</Box>
              {unreadCount ? <Badge badgeContent={unreadCount} color="secondary"><CommentIcon fontSize='small' color='primary' /></Badge> : ''} 
              </> : <></>
            }
          </ListItem>
        )
      })}
    </List>
  );

}

export default connect()(ConnectionsList);

