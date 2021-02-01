import React, { useEffect, useState } from 'react'
import { UpdateBulkMessages, updateOnline, UpdateSelectedUser } from '../actions';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText, ListItemIcon, Badge } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Connections, User } from '../App.config';
import { refreshFetch, exists } from '../App.fn';
import Dexie from 'dexie'

type ConnectionsProps = {
  user: User,
  connections: Connections,
  online: Connections,
  token: string,
  db: Dexie,
  dispatch: any
}

const ConnectionsList: React.FC<ConnectionsProps> = (props: ConnectionsProps) => {
  
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
      // token update
      
    }

  }, [props.connections]);

  const handleSelectedPeerChange = (event: React.MouseEvent, peer: User) => {
    props.db.table('messages').where('groupkey').equals(`${props.user.username}-${peer.username}`).sortBy('timestamp')
    .then(messages => {
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
            
            return (
              <ListItem key={`${JSON.stringify(props.connections[username])}-connection-${index}`} button selected={'' === props.connections[username].username} onClick={(event) => handleSelectedPeerChange(event, props.connections[username])}>
              {(exists(props.connections[props.connections[username].username])) ? 
                <>
                <ListItemIcon>
                  <FiberManualRecordIcon fontSize='small' style={{color: 'green'}} />
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

