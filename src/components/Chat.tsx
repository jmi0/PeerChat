import React, { Component } from 'react'
import Peer from 'peerjs' 
import moment from 'moment';
import CryptoJS from 'crypto-js';
import { Box, Badge, Button, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Grid from '@material-ui/core/Grid';

import { User, Connections, Messages, Message } from '../Interfaces'
import MessagesDisplay from './Messages';
import '../style/Chat.css';


type ChatProps = {
  localPeer: Peer,
  user: User
}

type ChatState = {
  localPeer: Peer,
  user: User,
  remotePeers: User[],
  selectedRemotePeer: User,
  textMessage: string,
  connections: Connections,
  messages: Messages,
  lastMessage: Message|Object
}

/************************************************************************
 * This component handles remote peer discovdery, connections, and 
 * messages between peers
 */
class Chat extends Component<ChatProps, ChatState> {

  // variable to hold interval for remote peer discovery
  private updateRemotePeersInterval : number = 0;
  private CLIENT_KEY : string = 'AfxKcLYZTn9SWcDZL';
  private chatWindowRef : React.RefObject<HTMLDivElement>|null  = React.createRef();

  constructor(props: ChatProps | Readonly<ChatProps>) {

    super(props);

    this.state = {
      localPeer: this.props.localPeer,
      user: this.props.user,
      remotePeers: [],
      selectedRemotePeer: {username: '', peerID: '', _id: ''},
      textMessage: '',
      connections: {},
      messages: {},
      lastMessage: {}
    };

    
    this.handleRemotePeerChange = this.handleRemotePeerChange.bind(this);
    this.connectToPeer = this.connectToPeer.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.updateSeenStateOnPeerMessages = this.updateSeenStateOnPeerMessages.bind(this);
  }

  componentDidMount() {
    
    /**
     * Check if logged in
     */
    /*
    fetch("/check")
    .then(res => res.json())
    .then((result) => {
      if (this.exists(result.username)) {
        this.setState({ username: result.username });
        localStorage.setItem(
          CryptoJS.SHA256(`lastUser`).toString(CryptoJS.enc.Base64), 
          CryptoJS.AES.encrypt(JSON.stringify({peerID: this.state.localPeerID, username: result.username, _id: ''}), `${this.CLIENT_KEY}lastUser`).toString()
        );
      } else {
        window.location.href = "/login";
      }
    }, (error) => {
      let lastUser: string|null = localStorage.getItem(CryptoJS.SHA256(`lastUser`).toString(CryptoJS.enc.Base64));
      if (lastUser !== null) {
         var user = JSON.parse(CryptoJS.AES.decrypt(lastUser, `${this.CLIENT_KEY}lastUser`).toString(CryptoJS.enc.Utf8));
        this.setState({ 
          username: user.username, 
          localPeerID: user.peerID, 
          localPeer: new Peer(user.peerID, {
            host: window.location.hostname, port: 9000, path: '/peerserver'
          })
        });
      } else {
        window.location.href = "/login";
      }
      
    })
    */
    
    
    // get local peer id from peer server
    this.state.localPeer.on('open', (peerid) => {
      let user: User = this.state.user;
      user.peerID = peerid;
      this.setState({user: user});
      //associate peer id to username on server side
      this.updateUserPeerID(user);
      // retrieve remote peers
      this.getRemotePeers();
    });

    // listen for connections
    this.state.localPeer.on('connection', (conn) => {

      // message receiver
      conn.on('data', (data) => {
        // received
        this.updateRemotePeerMessages(data.username, data.message, data.username);
      });
      
      // connection receiver
      conn.on('open', () => {
        // connected
        this.state.remotePeers.forEach((peer, index) => {
          if (peer.peerID === conn.peer) this.updateRemotePeerConnections(peer.username, conn);
        });
        
      });

    });

    // update remote peers list every second
    this.updateRemotePeersInterval = window.setInterval(() => {
      this.getRemotePeers();
    }, 1000);


  }

  scrollToBottom = () => {
    
    if (this.chatWindowRef !== null && this.chatWindowRef.current !== null) {
      this.chatWindowRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  componentWillUnmount() {
    // clear this interval before unmounting
    clearInterval(this.updateRemotePeersInterval);
  }

  /**
   * Peer discovery method
   */
  getRemotePeers() {
    fetch("/peers")
    .then(res => res.json())
    .then((result) => {
      // establish new connection if there is a change in peerid of existing connection
      result.forEach((peer: any) => {
        if (this.exists(this.state.connections[peer.username])) {
          if (peer.peerID !== this.state.connections[peer.username].peer) this.connectToPeer(peer);
        }
      });
      if (JSON.stringify(result) !== JSON.stringify(this.state.remotePeers)) this.setState({remotePeers: result});
    }, (error) => {
      console.log(error);
    });
  }

  
  updateUserPeerID(user: User) {
    fetch('/updatepeerid', {
      method: 'POST', 
      body: JSON.stringify({ 
        username: user.username,
        peerid: user.peerID
      }), 
      headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }


  updateSeenStateOnPeerMessages(peer: User) {
    if (this.exists(this.state.messages[peer.username])) {
      let peerMessages: Messages = this.state.messages;
      peerMessages[peer.username].forEach((message, index) => {
        peerMessages[peer.username][index].seen = true;
      }, () => {
        this.setState({messages: this.state.messages}, () => {
          this.scrollToBottom();
          localStorage.setItem(
            CryptoJS.SHA256(`${this.state.user.username}${peer.username}-messages`).toString(CryptoJS.enc.Base64), 
            CryptoJS.AES.encrypt(JSON.stringify(this.state.messages[peer.username]), `${this.CLIENT_KEY}${this.state.user.username}${peer.username}`).toString()
          );
        });
      });
      
    }
  }
  

  handleRemotePeerChange = (event: React.MouseEvent, peer: User) => {
    // get stored messages on connection for this user
    let peerMessages: string|null = localStorage.getItem(CryptoJS.SHA256(`${this.state.user.username}${peer.username}-messages`).toString(CryptoJS.enc.Base64));
    let messages: Messages = this.state.messages;
    if (peerMessages !== null)
      messages[peer.username] = JSON.parse(CryptoJS.AES.decrypt(peerMessages, `${this.CLIENT_KEY}${this.state.user.username}${peer.username}`).toString(CryptoJS.enc.Utf8));
    else messages[peer.username] = [];
    
    this.setState({selectedRemotePeer: peer, messages: messages}, () => {
      this.updateSeenStateOnPeerMessages(peer);
      this.connectToPeer(peer);
    });
    
  }

  updateRemotePeerConnections(username: string, conn: Object) {
    let connections: Connections = this.state.connections;
    connections[username] = conn;
    this.setState({connections: connections}, () => {
      this.scrollToBottom();
    }); 
  }

  updateRemotePeerMessages(username: string, textMessage: string, remotePeerIndex: string) {

    var messages: Messages = this.state.messages;
    if (!this.exists(messages[remotePeerIndex])) messages[remotePeerIndex] = [];

    let message = {
      message: {message: textMessage, username: username}, 
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), 
      from: username, 
      seen: (this.state.selectedRemotePeer.username === username)
    };

    messages[remotePeerIndex].push(message);
  
    localStorage.setItem(
      CryptoJS.SHA256(`${this.state.user.username}${remotePeerIndex}-messages`).toString(CryptoJS.enc.Base64), 
      CryptoJS.AES.encrypt(JSON.stringify(messages[remotePeerIndex]), `${this.CLIENT_KEY}${this.state.user.username}${remotePeerIndex}`).toString()
    );
    this.setState({messages: messages, lastMessage: message}, () => {
      this.scrollToBottom();
    });
    
  }

  connectToPeer(user: User) {

    var conn = this.props.localPeer.connect(user.peerID);
 
    conn.on('open', () => {
      this.updateRemotePeerConnections(user.username, conn);
      
    });

    conn.on('data', (data) => {
      this.updateRemotePeerMessages(data.username, data.message, data.username);
    });
    
  }

  sendMessage = (event: React.MouseEvent) => {
    this.state.connections[this.state.selectedRemotePeer.username].send({username: this.state.user.username, message: this.state.textMessage});
    this.updateRemotePeerMessages(this.state.user.username, this.state.textMessage, this.state.selectedRemotePeer.username);
    this.setState({textMessage: ''});
  }


  handleMessageChange = (event: React.ChangeEvent) => {
    this.setState({textMessage: (event.target as HTMLInputElement).value});
  }

  
  exists(v: any) {
    if (typeof v !== 'undefined') return true;
    else return false;
  }


  render() {
    
    const { user, remotePeers, connections, textMessage, selectedRemotePeer, messages, lastMessage } = this.state;
    
    return (
      <Grid container spacing={0}>

        <Grid item xs={12} sm={8}>
          <Box id='chat-window-container' >
            <Box id='chat-window'>
              <List>
              {this.exists(connections[selectedRemotePeer.username]) ? 
                <ListItem dense style={{color: 'green'}}>Connection opened with <b>&nbsp;{selectedRemotePeer.username}</b></ListItem> : 
                <></>
              }
              {this.exists(messages[selectedRemotePeer.username]) ?
                <>
                  <MessagesDisplay
                    messages={messages[selectedRemotePeer.username]}
                    localUsername={user.username}
                    remoteUsername={selectedRemotePeer.username}
                    lastMessage={lastMessage}
                  />
                </>
              : ''
              }
              </List>
              <div ref={this.chatWindowRef}></div>
            </Box>
            {this.exists(connections[selectedRemotePeer.username]) ?
            <Box boxShadow={1} id={'text-send-region-container'} style={{borderTop: '1px #d3d3d3 solid'}}>
              <Grid container spacing={0} id={'text-send-container'}>
                <Grid item xs={8}><textarea style={{width: '100%', resize: 'none'}} value={textMessage} onChange={this.handleMessageChange} rows={2}></textarea></Grid>
                <Grid item xs={2}><Button disableElevation variant="contained" color='primary' onClick={this.sendMessage} >Send</Button></Grid>
              </Grid>
            </Box> : ''
            }            
          </Box>
        </Grid>
        <Grid item xs={12} sm={4} style={{borderLeft: '1px #d3d3d3 solid'}} >
          
            
          <List key={JSON.stringify(remotePeers)} disablePadding>
          {(remotePeers.length < 2) ? 
            <ListItem disabled>No Peers Available</ListItem> :
            <>
            {remotePeers.map((peer: User) => {

              if (peer.username === user.username) return '';
              
              var unreadCount = 0;
              var hasMessages = false;
              if (this.exists(messages[peer.username])) {
                hasMessages = true;
                unreadCount = messages[peer.username].filter((message) => peer.username === message.from ? message.seen === false : false).length;
              }

              return (
                <ListItem key={JSON.stringify(peer)} button selected={selectedRemotePeer.username === peer.username} onClick={(event) => this.handleRemotePeerChange(event, peer)}>
                {this.exists(connections[peer.username]) ? 
                  <>
                  <ListItemIcon>
                    <FiberManualRecordIcon fontSize='small' style={{color: 'green'}} />
                  </ListItemIcon>
                  <ListItemText primary={peer.username} />
                  {hasMessages ? <Badge badgeContent={unreadCount} color="secondary"><CommentIcon fontSize='small' color='primary' /></Badge> : ''} 
                  </>: 
                  <ListItemText primary={peer.username} />
                }
                </ListItem>
              )
            })}
            </>
          }
          </List>
        </Grid>
        

      </Grid>
    );
  }

}



export default Chat;