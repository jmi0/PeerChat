import React, { useEffect, useState } from 'react'
import { updateOnline, UpdateSelectedUser } from '../actions';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText, ListItemIcon, Badge } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Connections, User } from '../App.config';
import Peer from 'peerjs';
import { refreshFetch, exists } from '../App.fn';

type ConnectionsProps = {
  user: User,
  connections: Connections
  token: string,
  dispatch: any
}

const ConnectionsList: React.FC<ConnectionsProps> = (props: ConnectionsProps) => {
  
  const [ token, setToken ] = useState(props.token);
  const [ online, setOnline ] = useState<User[]>([]);

  useEffect(() => {
    
    let discoveryInterval: number;

    const getRemotePeers = () => {
    
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', `Bearer ${token}`);
      refreshFetch('/peers', 'GET', headers, null)
      .then((result: any) => {
        
        // if token set then just update token
        if (exists(result.token)) setToken(result.token);
        else setOnline(result);
        
      })
      .catch((err) => {
        console.log(err);
      });
  
    }

    discoveryInterval = window.setInterval(() => {
      getRemotePeers();
    }, 1000);

    return () => {
      // token update
      clearInterval(discoveryInterval);
    }

  }, [token]);

  const handleSelectedPeerChange = (event: React.MouseEvent, peer: User) => {
    props.dispatch(UpdateSelectedUser(peer));
  }
 
  return (
    <List key={JSON.stringify(online)} disablePadding>
      {!(online.length-1) ? 
        <ListItem key={'nopeersavailable'} disabled>No Peers Available</ListItem> :
        <>
          {online.map((peer: User) => {

            if (peer.username === props.user.username) return;

            var unreadCount = 0;
            var hasMessages = false;
            
            return (
              <ListItem key={JSON.stringify(peer)} button selected={'' === peer.username} onClick={(event) => handleSelectedPeerChange(event, peer)}>
              {(exists(props.connections[peer.username])) ? 
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

