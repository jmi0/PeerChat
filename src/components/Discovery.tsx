import React, { useEffect, useState } from 'react'
import { UpdateBulkMessages, updateOnline, UpdateSelectedUser } from '../actions';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText, ListItemIcon, Badge } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Connections, User } from '../App.config';
import { refreshFetch, exists } from '../App.fn';
import Dexie from 'dexie'

type DiscoveryProps = {
  user: User,
  connections: Connections
  token: string,
  db: Dexie,
  dispatch: any
}

const DiscoveryList: React.FC<DiscoveryProps> = (props: DiscoveryProps) => {
  
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
        else {
          setOnline(result);
          props.dispatch(updateOnline(result));
        }
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
    props.db.table('messages').where('groupkey').equals(`${props.user.username}-${peer.username}`).sortBy('timestamp')
    .then(messages => {
      props.dispatch(UpdateBulkMessages(peer.username, messages));
      props.dispatch(UpdateSelectedUser(peer));
    })
    .catch((err) => { console.log(err); });
  }
 
  return (
    <List key={JSON.stringify(online)} disablePadding>
      {!(online.length-1) ? 
        <ListItem key={'nopeersavailable'} disabled>No Peers Available</ListItem> :
        <>
          {online.map((peer: User) => {

            if (peer.username === props.user.username) return;

            return (
              <ListItem key={JSON.stringify(peer)} button selected={'' === peer.username} onClick={(event) => handleSelectedPeerChange(event, peer)}>
                <ListItemText primary={peer.username} />
              </ListItem>
            )

          })}
        </>
      }
    </List>
  );

}

export default connect()(DiscoveryList);

