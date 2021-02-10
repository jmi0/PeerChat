import React from 'react'
import { connect } from 'react-redux';
import Dexie from 'dexie';

import { Connections, User } from '../App.config';
import { UpdateBulkMessages, UpdateConnections, UpdateSelectedUser } from '../actions';

import { List, ListItem, ListItemText } from '@material-ui/core';


type OnlineListProps = {
  user: User,
  online: Connections,
  db: Dexie,
  dispatch: any
}

const OnlineList: React.FC<OnlineListProps> = (props: OnlineListProps) => {
  
  const handleSelectedPeerChange = (event: React.MouseEvent, peer: User) => {
    props.db.table('messages').where('groupkey').equals(`${props.user.username}-${peer.username}`).sortBy('timestamp')
    .then(messages => {
      props.dispatch(UpdateBulkMessages(peer.username, messages));
      props.dispatch(UpdateSelectedUser(peer));
      props.dispatch(UpdateConnections(peer));
    })
    .catch((err) => { console.log(err); });
  }

  return (
    <List key={JSON.stringify(Object.keys(props.online))} disablePadding dense>
      <ListItem disabled>
        {!(Object.keys(props.online).length-1) ? 
        <ListItemText primary={'No Peers Available'} /> :
        <ListItemText primary={'Available Peers'} /> 
        }
      </ListItem>
      {Object.keys(props.online).map((username: string) => {
        if (props.online[username].username === props.user.username) return <></>;
        return (
          <ListItem key={JSON.stringify(props.online[username])} button selected={'' === props.online[username].username} onClick={(event) => handleSelectedPeerChange(event, props.online[username])}>
            <ListItemText primary={props.online[username].username} />
          </ListItem>
        )
      })}
    </List>
  );

}

export default connect()(OnlineList);

