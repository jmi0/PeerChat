import React, { Component } from 'react'
import Peer from 'peerjs' 
import moment from 'moment';
import CryptoJS from 'crypto-js';
import { Box, Badge, Button, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Grid from '@material-ui/core/Grid';
import MessagesDisplay from './Messages';
import '../style/Chat.css';


type ChatProps = {
  localPeer: Peer
}

interface Connections {
  [key: string]: any
}

interface User {
  username: string,
  peerID: string,
  _id: string
}

interface Message {
  message: { username: string, message: string},
  from: string,
  timestamp: string,
  seen: Boolean
}

interface Messages {
  [key: string]: Message[]
}

type ChatState = {
  remotePeers: User[],
  localPeer: Peer,
  localPeerID: string,
  selectedRemotePeer: User,
  textMessage: string,
  connections: Connections,
  messages: Messages,
  isLoggedIn: Boolean,
  username: string,
  lastMessage: Message|{}
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
      remotePeers: [],
      localPeer: this.props.localPeer,//
      localPeerID: '',
      selectedRemotePeer: {username: '', peerID: '', _id: ''},//
      textMessage: '',//
      connections: {},
      messages: {},//
      isLoggedIn: false,
      username: '',
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
    fetch("/check")
    .then(res => res.json())
    .then((result) => {
      if (this.exists(result.username)) {
        this.setState({ isLoggedIn: true, username: result.username });
        let messages: string|null = localStorage.getItem(CryptoJS.SHA256(`${result.username}-messages`).toString(CryptoJS.enc.Base64));
        if (messages !== null) this.setState({messages: JSON.parse(CryptoJS.AES.decrypt(messages, `${this.CLIENT_KEY}${result.username}`).toString(CryptoJS.enc.Utf8))});
        
      } else {
        window.location.href = "/login";
      }
    }, (error) => {
      //window.location.href = "/login";
    })

    
    
    // get local peer id from peer server
    this.state.localPeer.on('open', (peerid) => {
      this.setState({localPeerID: peerid});
      //assocciate peer id to username on server side
      this.setUserPeerID(peerid);
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
        this.state.remotePeers.find((peer, index) => {
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
      result.map((peer: any) => {
        if (this.exists(this.state.connections[peer.username])) {
          if (peer.peerID !== this.state.connections[peer.username].peer) this.connectToPeer(peer);
        }
      });
      if (JSON.stringify(result) !== JSON.stringify(this.state.remotePeers)) this.setState({remotePeers: result});
    }, (error) => {
      console.log(error);
    });
  }

  setUserPeerID(peerid: string) {
    fetch('/updatepeerid', {
      method: 'POST', 
      body: JSON.stringify({ 
        username: this.state.username,
        peerid: peerid
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
      this.state.messages[peer.username].forEach((message, index) => { this.state.messages[peer.username][index].seen = true; } )
      localStorage.setItem(
        CryptoJS.SHA256(`${this.state.username}-messages`).toString(CryptoJS.enc.Base64), 
        CryptoJS.AES.encrypt(JSON.stringify(this.state.messages), `${this.CLIENT_KEY}${this.state.username}`).toString()
      );
      this.setState({messages: this.state.messages}, () => {
        this.scrollToBottom();
      });
     
    }
  }
  
  handleRemotePeerChange = (event: React.MouseEvent, peer: User) => {
    this.setState({selectedRemotePeer: peer});
    this.updateSeenStateOnPeerMessages(peer);
    this.connectToPeer(peer);
  }

  updateRemotePeerConnections(username: string, conn: Object) {
    this.state.connections[username] = conn;
    this.setState({connections: this.state.connections}, () => {
      this.scrollToBottom();
    }); 
  }

  updateRemotePeerMessages(username: string, textMessage: string, remotePeerIndex: string) {

    if (!this.exists(this.state.messages[remotePeerIndex])) this.state.messages[remotePeerIndex] = [];

    let message = {
      message: {message: textMessage, username: username}, 
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), 
      from: username, 
      seen: (this.state.selectedRemotePeer.username === username)
    };
    this.state.messages[remotePeerIndex].push(message);
  
    localStorage.setItem(
      CryptoJS.SHA256(`${this.state.username}-messages`).toString(CryptoJS.enc.Base64), 
      CryptoJS.AES.encrypt(JSON.stringify(this.state.messages), `${this.CLIENT_KEY}${this.state.username}`).toString()
    );
    this.setState({messages: this.state.messages, lastMessage: message}, () => {
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
    this.state.connections[this.state.selectedRemotePeer.username].send({username: this.state.username, message: this.state.textMessage});
    this.updateRemotePeerMessages(this.state.username, this.state.textMessage, this.state.selectedRemotePeer.username);
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
    
    const { username, remotePeers, connections, textMessage, selectedRemotePeer, messages, localPeerID, lastMessage } = this.state;
    
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
                    localUsername={username}
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
              if (peer.username === username) return '';
              
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