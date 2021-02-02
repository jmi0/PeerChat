import React, { useEffect, useState } from 'react'
import { UpdateBulkMessages, updateOnline, UpdateSelectedUser } from '../actions';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Avatar, Badge } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import { makeStyles } from "@material-ui/core/styles";
import { Connections, User, Messages, Message } from '../App.config';
import { refreshFetch, exists } from '../App.fn';
import Dexie from 'dexie'

const useStyles = makeStyles({
  onlineBadge: {
    backgroundColor: "green",
    margin: 0,
  }
});


type ConnectionsProps = {
  user: User,
  selectedUser: User|false,
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
      props.db.table('user_connections').update(props.user.username, {connections: JSON.stringify(props.connections)})
      .then(function (updated) {
        if (updated) console.log (`${props.user.username} was updated in user_connections.`);
        else props.db.table('user_connections').put({username: props.user.username, connections: JSON.stringify(props.connections)})
        .then((id) => { console.log(`Created entry in user_connections: ${id}`); })
        .catch((err) => { console.log(err);})
      });
    }

    return () => {
      
      
    }

  }, [props.connections]);


  const handleSelectedPeerChange = (event: React.MouseEvent, peer: User) => {
    props.db.table('messages').where('groupkey').equals(`${props.user.username}-${peer.username}`).sortBy('timestamp')
    .then(messages => {
      // update seen states
      /*
      messages.map((message) => {
        if (!message.seen && message.to === props.user.username) {
          props.db.table('messages').update(message.id, {seen: true}).then((updated) => {
            if (updated) message.seen = true;
            else console.log(`Could not update ${message.id}`);
            return message;
          });
        } else return message;
      });
      */
      props.dispatch(UpdateBulkMessages(peer.username, messages));
      props.dispatch(UpdateSelectedUser(peer));
    })
    .catch((err) => { console.log(err); });
  }
 
  return (
    <List key={JSON.stringify(Object.keys(props.connections))} disablePadding>
      
      {Object.keys(props.connections).map((username: string, index: number) => {

        if (props.connections[username].username === props.user.username) return;
        
        var unreadCount = 0;
        var hasMessages = false;
        if (exists(props.messages[username])) {
          hasMessages = true;
          props.messages[username].forEach((message) => { if (!message.seen && message.to === props.user.username) unreadCount++; });
        }
            
        return (
          <ListItem key={`${JSON.stringify(props.connections[username])}-connection-${index}`} button selected={(props.selectedUser ? props.selectedUser.username : '') === props.connections[username].username} onClick={(event) => handleSelectedPeerChange(event, props.connections[username])}>
            {(exists(props.connections[username])) ? 
              <>
              <ListItemIcon>
                <ListItemAvatar>
                  {exists(props.online[username]) ? 
                    <Badge color={'secondary'} overlap="circle" classes={{badge: classes.onlineBadge}} variant="dot"><Avatar>{username.charAt(0)}</Avatar></Badge>: 
                      <Avatar>{username.charAt(0)}</Avatar>
                  }
                </ListItemAvatar>
              </ListItemIcon>
              <ListItemText primary={props.connections[username].username} />
                {hasMessages ? <Badge badgeContent={unreadCount} color="secondary"><CommentIcon fontSize='small' color='primary' /></Badge> : ''} 
              </> : <ListItemText primary={props.connections[username].username} />
            }
          </ListItem>
        )
      })}
    </List>
  );

}

export default connect()(ConnectionsList);

