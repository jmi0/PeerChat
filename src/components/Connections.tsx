import React, { useEffect, useState } from 'react'
import { updateOnline } from '../actions';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText, ListItemIcon, Badge } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Connections, User } from '../App.config';


type ConnectionsProps = {
  connections: Connections
  token: string
}



const ConnectionsList: React.FC<ConnectionsProps> = (props: ConnectionsProps) => {
  
  let discoveryInterval: number;

  const [ token, setToken ] = useState(props.token);

  useEffect(() => {
    
    discoveryInterval = window.setInterval(() => {
      //getRemotePeers();
    }, 1000);

    return () => {
      clearInterval(discoveryInterval);
    }

  }, []);

  const handleSelectedPeerChange = (event: React.MouseEvent, peer: User) => {
    console.log(peer);
  }

  const getRemotePeers = () => {

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    refreshFetch('/peers', 'GET', headers, null)
    .then((result: any) => {
      
      // if token set then just update token
      if (typeof result.token !== 'undefined') {
        console.log('new token:', result.token);
        setToken(result.token);
      }
      else {
        console.log('result',result);
      }
      
    })
    .catch((err) => {
      
    });

  }

  const refreshFetch = (url: string, method: string, headers: Headers, body: string|Blob|ArrayBufferView|ArrayBuffer|FormData|URLSearchParams|null|undefined) => {
    return new Promise((resolve, reject) => {
      // attempt to make request
      fetch(url, {method: method, headers: headers, body: body})
      .then(response => response.json())
      .then(result => {
        // token is expired
        if (typeof result.tokenexpired !== 'undefined') {
          // refresh token
          fetch('/refreshtoken', { method: 'POST', headers: {'Content-Type': 'application/json'}})
          .then(response => response.json())
          .then(result => {
            console.log('token expired');
            resolve(result);
          })
          .catch(err => reject(err))
        } else resolve(result);
      })
      .catch(err => reject(err) )
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

