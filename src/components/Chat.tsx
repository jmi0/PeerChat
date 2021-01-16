import React, { Component } from 'react'
import moment from 'moment';
import CryptoJS from 'crypto-js';
import { Box, Badge, Button, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Grid from '@material-ui/core/Grid';
import CLIENT_KEY, { ChatProps, ChatState, User, Connections, Messages } from '../App.config'
import MessagesDisplay from './Messages';
import '../style/Chat.css';
import { DataConnection } from 'peerjs';



/************************************************************************
 * This component handles remote peer discovery, connections, and 
 * messages between peers
 */
class Chat extends Component<ChatProps, ChatState> {

  // variable to hold interval for remote peer discovery
  private updateRemotePeersInterval : number = 0;
  private chatWindowRef : React.RefObject<HTMLDivElement>|null  = React.createRef();

  constructor(props: ChatProps | Readonly<ChatProps>) {

    super(props);

    this.state = {
      localPeer: this.props.localPeer,
      user: this.props.user,
      remotePeers: {},
      onlinePeers: {},
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
    
    // get persistent peers
    let peers: string|null = localStorage.getItem(CryptoJS.SHA256(`${this.state.user.username}-peers`).toString(CryptoJS.enc.Base64));
    //var remotePeers: {[key: string]: User} = this.state.remotePeers;
    if (peers !== null) {
      this.setState({ remotePeers: JSON.parse(CryptoJS.AES.decrypt(peers, `${CLIENT_KEY}${this.state.user.username}-peers`).toString(CryptoJS.enc.Utf8))});
    }

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
        Object.values(this.state.remotePeers).forEach((peer, index) => {
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
      
      if (JSON.stringify(result) !== JSON.stringify(Object.values(this.state.onlinePeers))) {
        
        var online: {[key: string]: User} = {};
        var remotePeers: {[key: string]: User} = this.state.remotePeers;
        result.forEach((peer: any) => {
          if (peer.username === this.state.user.username) return;
          online[peer.username] = peer;
          remotePeers[peer.username] = peer;
        });
        this.setState({onlinePeers: online, remotePeers: remotePeers });
      }
      }, (error) => {
        this.setState({onlinePeers: {} });
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
          //this.scrollToBottom();
          localStorage.setItem(
            CryptoJS.SHA256(`${this.state.user.username}${peer.username}-messages`).toString(CryptoJS.enc.Base64), 
            CryptoJS.AES.encrypt(JSON.stringify(this.state.messages[peer.username]), `${CLIENT_KEY}${this.state.user.username}${peer.username}`).toString()
          );
        });
      });
      
    }
  }
  

  handleRemotePeerChange = (event: React.MouseEvent, peer: User) => {
    // get stored messages on connection for this user
    let peerMessages: string|null = localStorage.getItem(CryptoJS.SHA256(`${this.state.user.username}${peer.username}-messages`).toString(CryptoJS.enc.Base64));
    let messages: Messages = this.state.messages;
    if (peerMessages !== null) messages[peer.username] = JSON.parse(CryptoJS.AES.decrypt(peerMessages, `${CLIENT_KEY}${this.state.user.username}${peer.username}`).toString(CryptoJS.enc.Utf8));
    else messages[peer.username] = [];
    
    this.setState({selectedRemotePeer: peer, messages: messages}, () => {
      this.updateSeenStateOnPeerMessages(peer);
      this.connectToPeer(peer);
      //this.scrollToBottom();
    });
    
  }

  
  updateRemotePeerConnections(username: string, conn: DataConnection) {
    let connections: Connections = this.state.connections;
    connections[username] = conn;
    this.setState({connections: connections}, () => {
      var persistentPeers = this.state.remotePeers;
      persistentPeers[username] = {username: username, peerID: conn.peer, _id: ''};
      this.updatePersistentPeers(persistentPeers);
    }); 
  }

  updatePersistentPeers(peers: {[key: string]: User}) {
    localStorage.setItem(
      CryptoJS.SHA256(`${this.state.user.username}-peers`).toString(CryptoJS.enc.Base64), 
      CryptoJS.AES.encrypt(JSON.stringify(peers), `${CLIENT_KEY}${this.state.user.username}-peers`).toString()
    );
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
  
    this.setState({messages: messages, lastMessage: message}, () => {
      //this.scrollToBottom();
      localStorage.setItem(
        CryptoJS.SHA256(`${this.state.user.username}${remotePeerIndex}-messages`).toString(CryptoJS.enc.Base64), 
        CryptoJS.AES.encrypt(JSON.stringify(messages[remotePeerIndex]), `${CLIENT_KEY}${this.state.user.username}${remotePeerIndex}`).toString()
      );
    });
    
  }

  connectToPeer(user: User) {
    
    if (this.exists(this.state.connections[user.username]) && this.state.connections[user.username].open) return; 
    
    let conn = this.props.localPeer.connect(user.peerID);
    
    if (!conn) return;
   
    conn.on('open', () => {
      console.log('open');
      this.updateRemotePeerConnections(user.username, conn);
    });

    conn.on('data', (data) => {
      this.updateRemotePeerMessages(data.username, data.message, data.username);
    });
 
    conn.on('error', function(err) { 
      console.log(err);
    });
    
  }

  // Messenger
  sendMessage = (event: React.MouseEvent) => {
    this.state.connections[this.state.selectedRemotePeer.username].send({username: this.state.user.username, message: this.state.textMessage});
    this.updateRemotePeerMessages(this.state.user.username, this.state.textMessage, this.state.selectedRemotePeer.username);
    this.setState({textMessage: ''});
  }

  // Messenger
  handleMessageChange = (event: React.ChangeEvent) => {
    this.setState({textMessage: (event.target as HTMLInputElement).value});
  }

  
  exists(v: any) {
    if (typeof v !== 'undefined') return true;
    else return false;
  }


  render() {
    
    const { user, remotePeers, onlinePeers, connections, textMessage, selectedRemotePeer, messages, lastMessage } = this.state;
    
    return (
      <>
      <Grid item xs={12} sm={8}>
        <Box id='chat-window-container' >
          <Box id='chat-window'>
            <List>
            {this.exists(connections[selectedRemotePeer.username]) ? 
              <ListItem dense style={{color: 'green'}}>
                Connection opened with <b>&nbsp;{selectedRemotePeer.username}</b>
              </ListItem> : <></>
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
              : <></>
            }
            </List>
          </Box>
          {this.exists(connections[selectedRemotePeer.username]) ?
          <Box boxShadow={1} id={'text-send-region-container'} style={{borderTop: '1px #d3d3d3 solid'}}>
            <Grid container spacing={0} id={'text-send-container'}>
              <Grid item xs={8}><textarea style={{width: '100%', resize: 'none'}} value={textMessage} onChange={this.handleMessageChange} rows={2}></textarea></Grid>
              <Grid item xs={2}><Button disableElevation variant="contained" color='primary' onClick={this.sendMessage} >Send</Button></Grid>
            </Grid>
          </Box> : <></>
          }            
        </Box>
      </Grid>
      <Grid item xs={12} sm={4} style={{borderLeft: '1px #d3d3d3 solid'}} >
        
        <List key={`${JSON.stringify(remotePeers)}${JSON.stringify(onlinePeers)}`} disablePadding>
        {(!Object.values(remotePeers).length && !Object.values(onlinePeers).length) ? 
        <ListItem disabled>No Peers Available</ListItem> :
          <>
          {Object.values(remotePeers).map((peer: User) => {
            
            var unreadCount = 0;
            var hasMessages = false;
            
            if (this.exists(messages[peer.username])) {
              hasMessages = true;
              unreadCount = messages[peer.username].filter((message) => peer.username === message.from ? message.seen === false : false).length;
            }

            return (
              <ListItem key={JSON.stringify(peer)} button selected={selectedRemotePeer.username === peer.username} onClick={(event) => this.handleRemotePeerChange(event, peer)}>
                {this.exists(onlinePeers[peer.username]) ? 
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
          {Object.values(onlinePeers).map((peer: User) => {
            if (this.exists(remotePeers[peer.username])) return <></>;
            else if (peer.username === user.username) return <></>;
            else return (
              <ListItem key={JSON.stringify(peer)} button selected={selectedRemotePeer.username === peer.username} onClick={(event) => this.handleRemotePeerChange(event, peer)}>
                <ListItemText primary={peer.username} />
              </ListItem>
            );
          })}
          </>
        }
        </List>
        
      </Grid>
      </>
    );
  }

}



export default Chat;