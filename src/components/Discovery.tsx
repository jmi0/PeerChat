import React, { useEffect, useState } from 'react'
import { UpdateBulkMessages, UpdateConnections, updateOnline, UpdateSelectedUser } from '../actions';
import { connect } from 'react-redux';
import { List, ListItem, ListItemText } from '@material-ui/core';
import { Connections, User } from '../App.config';
import { refreshFetch, exists } from '../App.fn';
import Dexie from 'dexie'

type DiscoveryProps = {
  user: User,
  token: string,
  db: Dexie,
  dispatch: any
}

const DiscoveryList: React.FC<DiscoveryProps> = (props: DiscoveryProps) => {
  
  const [ token, setToken ] = useState(props.token);
  const [ online, setOnline ] = useState<{[key: string]: User}>({});

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
      })
  
    }

    getRemotePeers();

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
      props.dispatch(UpdateConnections(peer));
    })
    .catch((err) => { console.log(err); });
  }
 
  return (
    <List key={JSON.stringify(Object.keys(online))} disablePadding dense>
      <ListItem disabled>
        {!(Object.keys(online).length-1) ? 
        <ListItemText primary={'No Peers Available'} /> :
        <ListItemText primary={'Available Peers'} /> 
        }
      </ListItem>
      {Object.keys(online).map((username: string) => {
        if (online[username].username === props.user.username) return;
        return (
          <ListItem key={JSON.stringify(online[username])} button selected={'' === online[username].username} onClick={(event) => handleSelectedPeerChange(event, online[username])}>
            <ListItemText primary={online[username].username} />
          </ListItem>
        )
      })}
    </List>
  );

}

export default connect()(DiscoveryList);

