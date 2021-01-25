import React, { useEffect, useState } from 'react'
import { updateOnline } from '../actions';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText, ListItemIcon, Badge } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Connections, User } from '../App.config';


type ConnectionsProps = {
  connections: Connections
}



const ConnectionsList: React.FC<ConnectionsProps> = (props: ConnectionsProps) => {
  
  const handleSelectedPeerChange = (event: React.MouseEvent, peer: User) => {
    console.log(peer);
    
  }

  useEffect(() => {
    
  });

 
  return (
    <List  disablePadding>
      {(!Object.values(props.connections).length) ? 
        <ListItem key={'nopeersavailable'} disabled>No Peers Available</ListItem> :
        <>
          {Object.values(props.connections).map((peer: User) => {
            var unreadCount = 0;
            var hasMessages = false;
            
            return (
              <ListItem key={JSON.stringify(peer)} button selected={'' === peer.username} onClick={(event) => handleSelectedPeerChange(event, peer)}>
              {(typeof props.connections[peer.username]) ? 
                <>
                <ListItemIcon>
                  <FiberManualRecordIcon fontSize='small' style={{color: 'green'}} />
                </ListItemIcon>
                <ListItemText primary={peer.username} />
                {hasMessages ? <Badge badgeContent={unreadCount} color="secondary"><CommentIcon fontSize='small' color='primary' /></Badge> : ''} 
                </>: <ListItemText primary={peer.username} />
              }
              </ListItem>
            )
          })}
        </>
      }
    </List>
  );

}

export default connect()(ConnectionsList);

