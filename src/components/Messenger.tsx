import React, { Component } from 'react';
import moment from 'moment';
import { Box, List, ListItem, Grid, Button } from '@material-ui/core';
import CLIENT_KEY, { Message, User } from '../App.config';
import MessagesDisplay from './Messages';
import CryptoJS from 'crypto-js';

type MessengerProps = {
  localPeer: User,
  remotePeer: User,
  remotePeerConnection: any,
  messages: Message[],
}

type MessengerState = {
  localPeer: User,
  remotePeer: User,
  remotePeerConnection: any,
  messages: Message[],
  lastMessage: Message|Object,
  textMessage: string
}



/************************************************************************
 * 
 */
class Messenger extends Component<MessengerProps, MessengerState> {

  private chatWindowRef : React.RefObject<HTMLDivElement>|null  = React.createRef();

  constructor(props: MessengerProps | Readonly<MessengerProps>) {

    super(props);

    this.state = {
      localPeer: this.props.localPeer,
      remotePeer: this.props.remotePeer,
      remotePeerConnection: this.props.remotePeerConnection,
      messages: this.props.messages,
      lastMessage: {},
      textMessage: ''
    }

  }

  // Messenger
  sendMessage = (event: React.MouseEvent) => {
    const { remotePeerConnection, messages, localPeer, remotePeer, textMessage } = this.state;
    remotePeerConnection.send({username: localPeer.username, message: textMessage});
    this.updateMessages(localPeer.username, remotePeer.username, textMessage);
    this.setState({textMessage: ''});
    
  }

  // Messenger
  handleMessageChange = (event: React.ChangeEvent) => {
    this.setState({textMessage: (event.target as HTMLInputElement).value});
  }
  
  updateMessages(localPeerUsername: string, remotePeerUsername: string, textMessage: string) {
    
    var messages: Message[] = this.state.messages;

    let message: Message = {
      message: {message: textMessage, username: localPeerUsername}, 
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), 
      from: localPeerUsername, 
      seen: (remotePeerUsername === localPeerUsername)
    };

    messages.push(message);
  
    localStorage.setItem(
      CryptoJS.SHA256(`${localPeerUsername}${remotePeerUsername}-messages`).toString(CryptoJS.enc.Base64), 
      CryptoJS.AES.encrypt(JSON.stringify(messages), `${CLIENT_KEY}${localPeerUsername}${remotePeerUsername}`).toString()
    );
    this.setState({messages: messages, lastMessage: message}, () => {
      this.scrollToBottom();
    });
    
    
  }

  scrollToBottom = () => {
    
    if (this.chatWindowRef !== null && this.chatWindowRef.current !== null) {
      this.chatWindowRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };


  render() {

    const { localPeer, remotePeer, remotePeerConnection, messages, lastMessage, textMessage } = this.state;
    console.log(this.state);
    return (
      <>
        <Box id='chat-window-container' >
          <Box id='chat-window'>
            <List>
              {(remotePeerConnection) ? 
                <ListItem dense style={{color: 'green'}}>Connection opened with <b>&nbsp;{remotePeer.username}</b></ListItem> : 
                <></>
              }
              {(messages) ?
                <MessagesDisplay
                messages={messages}
                localUsername={localPeer.username}
                remoteUsername={remotePeer.username}
                lastMessage={lastMessage}
              />: <></>}
              
            </List>
            <div ref={this.chatWindowRef}></div>
          </Box>
          {(remotePeerConnection) ?
          <Box boxShadow={1} id={'text-send-region-container'} style={{borderTop: '1px #d3d3d3 solid'}}>
            <Grid container spacing={0} id={'text-send-container'}>
              <Grid item xs={8}><textarea style={{width: '100%', resize: 'none'}} value={textMessage} onChange={this.handleMessageChange} rows={2}></textarea></Grid>
              <Grid item xs={2}><Button disableElevation variant="contained" color='primary' onClick={this.sendMessage} >Send</Button></Grid>
            </Grid>
          </Box> : <></>
          }            
        </Box>
      </>
    );
  }

}



export default Messenger;