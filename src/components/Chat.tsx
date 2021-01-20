import React, { Component } from 'react'
import moment from 'moment';
import CryptoJS from 'crypto-js';
import { Box, Badge, List, ListItem, ListItemText, ListItemIcon, Fab } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import SendSharpIcon from '@material-ui/icons/SendSharp';
import CLIENT_KEY, { ChatProps, ChatState, User, Connections, Messages } from '../App.config'
import MessagesDisplay from './Messages';
import '../style/Chat.scss';
import Peer, { DataConnection } from 'peerjs';



/************************************************************************
 * This component handles remote peer discovery, updating username/peerid associaiton on server, connections, and 
 * messages between peers
 */
class Chat extends Component<ChatProps, ChatState> {

  // variable to hold interval for remote peer discovery
  private updateRemotePeersInterval : number = 0;
  

  constructor(props: ChatProps | Readonly<ChatProps>) {

    super(props);

    this.state = {
      user: this.props.user,
      token: this.props.token,
      peer: null,
      remotePeers: {},
      onlinePeers: {},
      connections: {},
      messages: {},
      selectedRemotePeer: {username: '', peerID: ''},
      textMessage: '',
      lastMessage: {},
      offline: false,
    };

    this.setUpPeer = this.setUpPeer.bind(this);
    this.handleRemotePeerChange = this.handleRemotePeerChange.bind(this);
    this.connectToPeer = this.connectToPeer.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getRemotePeers = this.getRemotePeers.bind(this);
    this.updateUserPeerID = this.updateUserPeerID.bind(this);
    this.updateRemotePeerConnections = this.updateRemotePeerConnections.bind(this);
    this.updatePersistentPeers = this.updatePersistentPeers.bind(this);
    this.updateRemotePeerMessages = this.updateRemotePeerMessages.bind(this);
    this.updateSeenStateOnPeerMessages = this.updateSeenStateOnPeerMessages.bind(this);

  }


  componentDidMount() {
    
    // get persistent peers
    let peers: string|null = localStorage.getItem(CryptoJS.SHA256(`${this.state.user.username}-peers`).toString(CryptoJS.enc.Base64));
    if (peers !== null) this.setState({ remotePeers: JSON.parse(CryptoJS.AES.decrypt(peers, `${CLIENT_KEY}${this.state.user.username}-peers`).toString(CryptoJS.enc.Utf8))});
    
    this.setUpPeer(new Peer({
      host: window.location.hostname,
      port: 9000, 
      path: '/peerserver'
    }));

    // update remote peers list every second
    this.updateRemotePeersInterval = window.setInterval(() => {
      this.getRemotePeers();
    }, 1000);

  }


  componentWillUnmount() {
    // clear this interval before unmounting
    clearInterval(this.updateRemotePeersInterval);
    if (this.state.peer) this.state.peer.destroy();
  }


  exists(v: any) {
    if (typeof v !== 'undefined') return true;
    else return false;
  }


  setUpPeer(peer: Peer) {

    // get local peer id from peer server
    peer.on('open', (peerid) => {
      
      let user: User = this.state.user;
      user.peerID = peerid;
      this.setState({user: user});
      //associate peer id to username on server side
      this.updateUserPeerID(user);
      // retrieve remote peers
      this.getRemotePeers();
    });

    // listen for connections
    peer.on('connection', (conn) => {
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

    peer.on('disconnected', () => {
      console.log('disconnected');
    });

    peer.on('error', (err) => {
      console.log(err);
      console.log(`ERROR: ${err.message}`);
    });

    this.setState({ peer: peer });
  }


  /**
   * Peer discovery method
   */
  getRemotePeers() {
    
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${this.state.token}`);
    this.refreshFetch('/peers', 'GET', headers, null)
    .then((result: any) => {
      
      if (this.state.offline) {
        // if server was offline then create a new peer and update
        // this will trigger another call to updateUserPeerID()
        this.setUpPeer(new Peer({
          host: window.location.hostname,
          port: 9000, 
          path: '/peerserver'
        }));
      }
      
      // if token set then just update token
      if (this.exists(result.token)) this.setState({token: result.token});

      else {

        // initialize to assign to state
        var online: {[key: string]: User} = {};
        var remotePeers: {[key: string]: User} = this.state.remotePeers;

        // make state updates about our peers (connections and online status)
        result.forEach((peer: User) => {

          // add to remote peer and online peer lists (if not self)
          if (peer.username !== this.state.user.username) {
            online[peer.username] = peer;
            remotePeers[peer.username] = peer;
          }

          // reconnect any broken connections on online peer update
          // if connection exists
          if (this.exists(this.state.connections[peer.username])) {
            
            // if peer id changed create new connection
            if (this.state.connections[peer.username].peer !== peer.peerID) this.connectToPeer(peer);
            
          }

        });

        this.setState({onlinePeers: online, remotePeers: remotePeers, offline: false });

      }
      
    })
    .catch((err) => {
      this.setState({onlinePeers: {}, offline: true });
      if (this.state.peer) this.state.peer.destroy();
    });

  }


  refreshFetch(url: string, method: string, headers: Headers, body: string|Blob|ArrayBufferView|ArrayBuffer|FormData|URLSearchParams|null|undefined) {
    return new Promise((resolve, reject) => {
      // attempt to make request
      fetch(url, {method: method, headers: headers, body: body})
      .then(response => response.json())
      .then(result => {
        // token is expired
        if (this.exists(result.tokenexpired)) {
          // refresh token
          fetch('/refreshtoken', { method: 'POST', headers: {'Content-Type': 'application/json'}})
          .then(response => response.json())
          .then(result => {
            resolve(result);
          })
          .catch(err => reject(err))
        } else resolve(result);
      })
      .catch(err => reject(err) )
    });
  }


  
  updateUserPeerID(user: User) {
    
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${this.state.token}`);
    this.refreshFetch('/updatepeerid', 'POST', headers, JSON.stringify({ peerid: user.peerID }))
    .then((result: any) => {
      if (this.exists(result.token))
        this.setState({token: result.token, offline: false}, () => { this.updateUserPeerID(user); });
      else this.setState({ offline: false });
    })
    .catch((err) => {
      this.setState({ offline: true });
      if (this.state.peer) this.state.peer.destroy();
      console.log('Error:', err);
    });
  }


  updateSeenStateOnPeerMessages(peer: User) {
    if (this.exists(this.state.messages[peer.username])) {
      let peerMessages: Messages = this.state.messages;
      peerMessages[peer.username].forEach((message, index) => {
        peerMessages[peer.username][index].seen = true;
      });

      this.setState({messages: this.state.messages}, () => {
        localStorage.setItem(
          CryptoJS.SHA256(`${this.state.user.username}${peer.username}-messages`).toString(CryptoJS.enc.Base64), 
          CryptoJS.AES.encrypt(JSON.stringify(this.state.messages[peer.username]), `${CLIENT_KEY}${this.state.user.username}${peer.username}`).toString()
        );
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
    });
  }

  
  updateRemotePeerConnections(username: string, conn: DataConnection) {
    let connections: Connections = this.state.connections;
    connections[username] = conn;
    this.setState({connections: connections}, () => {
      var persistentPeers = this.state.remotePeers;
      persistentPeers[username] = {username: username, peerID: conn.peer };
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

    if (!this.exists(messages[remotePeerIndex])) {
      // check localStorage 
      let peerMessages: string|null = localStorage.getItem(CryptoJS.SHA256(`${this.state.user.username}${remotePeerIndex}-messages`).toString(CryptoJS.enc.Base64));
      if (peerMessages !== null) messages[remotePeerIndex] = JSON.parse(CryptoJS.AES.decrypt(peerMessages, `${CLIENT_KEY}${this.state.user.username}${remotePeerIndex}`).toString(CryptoJS.enc.Utf8));
      else messages[remotePeerIndex] = [];
    }

    let message = {
      message: {message: textMessage, username: username}, 
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), 
      from: username, 
      seen: (this.state.selectedRemotePeer.username === username)
    };

    messages[remotePeerIndex].push(message);
  
    this.setState({messages: messages, lastMessage: message});

    localStorage.setItem(
      CryptoJS.SHA256(`${this.state.user.username}${remotePeerIndex}-messages`).toString(CryptoJS.enc.Base64), 
      CryptoJS.AES.encrypt(JSON.stringify(messages[remotePeerIndex]), `${CLIENT_KEY}${this.state.user.username}${remotePeerIndex}`).toString()
    );
    
  }


  connectToPeer(user: User) {
    
    if (!this.state.peer) return;

    if (!this.exists(this.state.onlinePeers[user.username])) return;

    if (this.exists(this.state.connections[user.username]) && this.state.connections[user.username].open) return; 
    
    let conn = this.state.peer.connect(user.peerID);
    
    if (!conn) return;
   
    conn.on('open', () => {
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

  
  render() {
    
    const { user, remotePeers, onlinePeers, connections, textMessage, selectedRemotePeer, messages, lastMessage } = this.state;
    
    return (
      <>
      
        <Box className={'conversation-area'} >
          
          <List key={`${JSON.stringify(remotePeers)}${JSON.stringify(onlinePeers)}`} disablePadding>
          {(!Object.values(remotePeers).length && !Object.values(onlinePeers).length) ? 
            <ListItem key={'nopeersavailable'} disabled>No Peers Available</ListItem> :
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
          
        </Box>
        
        <Box className='chat-area' >
            <Box className='chat-area-header' key={`header-connected-${this.exists(connections[selectedRemotePeer.username]) && connections[selectedRemotePeer.username].open}`}>
              <h2 className='peer-title'>{selectedRemotePeer.username}</h2>
              {this.exists(connections[selectedRemotePeer.username]) && connections[selectedRemotePeer.username].open ? <span style={{color:'green'}}> Connected</span> : <></>}
            </Box>
            <Box className='chat-area-main'>
              <List>
              
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
            <Box className={'chat-area-footer'} key={`${this.exists(connections[selectedRemotePeer.username]) && connections[selectedRemotePeer.username].open}`}>
              <Box id={'text-send-container'}>
                
                {this.exists(connections[selectedRemotePeer.username]) && connections[selectedRemotePeer.username].open ?
                <>  
                  <div id='message-textarea-container'><textarea placeholder='Type message here...' value={textMessage} onChange={this.handleMessageChange} rows={2}></textarea></div>
                  <div id='message-btn-container'><Fab size="small" color='primary' onClick={this.sendMessage} ><SendSharpIcon /></Fab></div>
                </>
                : <></>
                }       
              </Box>
            </Box>     
        </Box>
      </>
    );
  }

}


export default Chat;