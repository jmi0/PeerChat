/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 11:20:29 
 * @Last Modified by:   joe.iannone 
 * @Last Modified time: 2021-02-10 11:20:29 
 */

import React from 'react'
import { connect } from 'react-redux';

import { OnlineListProps, User } from '../App.config';
import { UpdateBulkMessages, UpdateConnections, UpdateSelectedUser } from '../actions';

import { List, ListItem, ListItemText } from '@material-ui/core';


/**
 * Display unfiltered list of all peers online
 * 
 * @param props : OnlineListProps
 */
const OnlineList: React.FC<OnlineListProps> = (props: OnlineListProps) => {
  
  /**
   * Handle peer selection change
   * 
   * @param event 
   * @param peer 
   */
  const handleSelectedPeerChange = (event: React.MouseEvent, peer: User) => {
    // retrieve any messages between both peers from db
    props.db.table('messages').where('groupkey').equals(`${props.user.username}-${peer.username}`).sortBy('timestamp')
    .then(messages => {
      // dispatch selection change and chat data to redux store
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

