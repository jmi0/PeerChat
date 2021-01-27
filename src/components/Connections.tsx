import React, { useEffect, useState } from 'react'
import { updateOnline } from '../actions';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText, ListItemIcon, Badge } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Connections, User } from '../App.config';
import Peer from 'peerjs';
import { refreshFetch, exists } from '../App.fn'

type ConnectionsProps = {
  connections: Connections
  token: string
}



const ConnectionsList: React.FC<ConnectionsProps> = (props: ConnectionsProps) => {
  
  

  const [ token, setToken ] = useState(props.token);

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
        else {
          console.log('result', result);
        }
        
      })
      .catch((err) => {
        
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
    console.log(peer);
  }

  

  

  

  const updateUserPeerID = (peerid: string) => {
    
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    refreshFetch('/updatepeerid', 'POST', headers, JSON.stringify({ peerid: peerid }))
    .then((result: any) => {
      if (exists(result.token)) setToken(result.token);
    })
    .catch((err) => {
      //this.state.peer?.destroy();
    });
  }
 
  return (
    <List  disablePadding>
      {(!Object.values(props.connections).length) ? 
        <ListItem key={'nopeersavailable'} disabled>No Peers Available</ListItem> :
        <>
          {Object.values(props.connections).map((peer: any) => {
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

