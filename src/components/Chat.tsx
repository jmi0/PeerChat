import { Component } from 'react'
import Peer from 'peerjs' 
import moment from 'moment';
import { Box, Badge, Button, List, ListItem, ListItemText, ListItemIcon, SwipeableDrawer } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Grid from '@material-ui/core/Grid';
import '../style/Chat.css';


type ChatProps = {
  localPeer: Peer
}

interface Connections {
  [key: string]: any
}

interface Message {
  message: string,
  fromPeerID: string,
  timestamp: moment.Moment,
  seen: Boolean
}

interface User {
  PeerID: string,
  username: string,
  userkey: string,
}

interface Messages {
  [key: string]: Message[]
}

type ChatState = {
  remotePeers: string[],
  localPeer: Peer,
  localPeerID: string,
  selectedRemotePeerID: string,
  textMessage: string,
  connections: Connections,
  messages: Messages

}

/************************************************************************
 * This component handles remote peer discovdery, connections, and 
 * messages between peers
 */
class Chat extends Component<ChatProps, ChatState> {

  // variable to hold interval for remote peer discovery
  private updateRemotePeersInterval : number = 0;
  
  constructor(props: ChatProps | Readonly<ChatProps>) {

    super(props);

    this.state = {
      remotePeers: [],
      localPeer: this.props.localPeer,
      localPeerID: '',
      selectedRemotePeerID: '',
      textMessage: '',
      connections: {},
      messages: {}
    };

    this.handleRemotePeerChange = this.handleRemotePeerChange.bind(this);
    this.connectToPeer = this.connectToPeer.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.updateSeenStateOnPeerMessages = this.updateSeenStateOnPeerMessages.bind(this);
  }

  componentDidMount() {

    let messages: string|null = localStorage.getItem('messages');
    if (messages !== null) this.setState({messages: JSON.parse(messages)});
    
    // get local peer id from peer server
    this.state.localPeer.on('open', (peerid) => {
      this.setState({localPeerID: peerid});
      // retrieve remote peers
      this.getRemotePeers();
    });

    // listen for connections
    this.state.localPeer.on('connection', (conn) => {

      // message receiver
      conn.on('data', (data) => {
        // received
        this.updateRemotePeerMessages(conn.peer, data, conn.peer);
      });
      
      // connection receiver
      conn.on('open', () => {
        // connected
        //if (!this.exists(this.state.connections[conn.peer])) conn.send(`Connection opened with ${this.state.localPeerID}`);
        this.updateRemotePeerConnections(conn.peer, conn);
      });

    });

    // update remote peers list every second
    this.updateRemotePeersInterval = window.setInterval(() => {
      this.getRemotePeers();
    }, 1000);


  }

  componentWillUnmount() {
    // clear this interval before unmounting
    clearInterval(this.updateRemotePeersInterval);
  }

  /**
   * Peer discovery method
   */
  getRemotePeers() {
    fetch("/peerserver/peerjs/peers")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            remotePeers: result
          });
        },
        (error) => {
          console.log(error);
        }
      )
  }

  updateSeenStateOnPeerMessages(peerID: string) {
    if (this.exists(this.state.messages[peerID])) {
      var messages = this.state.messages;
      // update seen state of messages from this peer
      let peerMessages = messages[peerID];
      messages[peerID].forEach((message, index) => { messages[peerID][index].seen = true; } )
      this.setState({messages: messages});
      //localStorage.setItem('messages', JSON.stringify(messages));
    }
  }

  
  handleRemotePeerChange = (event: React.MouseEvent, peerID: string) => {
    this.setState({selectedRemotePeerID: peerID});
    this.updateSeenStateOnPeerMessages(peerID);
    this.connectToPeer(peerID);
  }

  updateRemotePeerConnections(remotePeerID: string, conn: Object) {
    
    let connections: Connections = this.state.connections;
    connections[remotePeerID] = conn;
    this.setState({connections: connections});
    
  }

  updateRemotePeerMessages(fromPeerID: string, textMessage: string, remotePeerIndex: string) {
    
    let messages: Messages = this.state.messages;

    if (!this.exists(messages[remotePeerIndex])) messages[remotePeerIndex] = [];

    messages[remotePeerIndex].push({
      message: textMessage, 
      timestamp: moment(), 
      fromPeerID: fromPeerID, 
      seen: (this.state.selectedRemotePeerID === fromPeerID)
    });
    
    this.setState({messages: messages});
    //localStorage.setItem('messages', JSON.stringify(messages));
  }

  connectToPeer(remotePeerID: string) {
    
    var conn = this.props.localPeer.connect(remotePeerID);
 
    conn.on('open', () => {
      //if (!this.exists(this.state.connections[remotePeerID])) conn.send(`<b>Connection opened with ${this.state.localPeerID}</b>`);
      this.updateRemotePeerConnections(remotePeerID, conn);
    });

    conn.on('data', (data) => {
      this.updateRemotePeerMessages(conn.peer, data, conn.peer);
      console.log(conn.peer, this.state.messages[conn.peer]);
    });
    
  }

  sendMessage = (event: React.MouseEvent) => {
    this.state.connections[this.state.selectedRemotePeerID].send(this.state.textMessage);
    this.updateRemotePeerMessages(this.state.localPeerID, this.state.textMessage, this.state.selectedRemotePeerID);
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

    const { remotePeers, localPeerID, connections, textMessage, selectedRemotePeerID, messages } = this.state;
    
    return (
      <Grid container spacing={0}>

        <Grid item xs={12} sm={8}>
          <Box id='chat-window-container' >
            <Box id='chat-window'>
              <List>
              {this.exists(connections[selectedRemotePeerID]) ? 
                <ListItem dense style={{color: 'green'}}>Connection opened with <b>&nbsp;{selectedRemotePeerID}</b></ListItem> : 
                <></>
              }
              {this.exists(messages[selectedRemotePeerID]) ?
              <>
              {messages[selectedRemotePeerID].map((message) => {
                return (
                  <ListItem dense key={JSON.stringify(message)}>
                    <Grid container justify="flex-start" direction="row">
                      <Grid item xs={1}><AccountCircleIcon style={{float: 'left'}} color={message.fromPeerID === localPeerID ? 'primary':'secondary'} fontSize={'large'} /></Grid>
                      <Grid item xs={11} className={'messageDisplaycontainer'}>
                        <div>
                          <span className='messageDisplayName'>{message.fromPeerID}</span>
                          <span className='messageDisplayTS'>{message.timestamp.format('M/D/YY h:mm a')}</span>
                        </div>
                        <div className='messageDisplayMSG'>{message.message}</div>  
                      </Grid>
                    </Grid>
                    

                   
                  </ListItem>
                );
              })}
              </> : ''
              }
              </List>
            </Box>
            {this.exists(connections[selectedRemotePeerID]) ?
            <Box boxShadow={1} id={'text-send-region-container'}>
              <Grid container spacing={0} id={'text-send-container'}>
                <Grid item xs={8}><textarea style={{width: '100%', resize: 'none'}} value={textMessage} onChange={this.handleMessageChange} rows={2}></textarea></Grid>
                <Grid item xs={2}><Button disableElevation variant="contained" color='primary' onClick={this.sendMessage}>Send</Button></Grid>
              </Grid>
            </Box> : ''
            }            
          </Box>
        </Grid>
        <Grid item xs={12} sm={4} style={{borderLeft: '1px #d3d3d3 solid'}} >
          
            
          <List disablePadding>
          {(remotePeers.length < 2) ? 
            <ListItem disabled>No Peers Available</ListItem> :
            <>
            {remotePeers.map((peerID: string) => {
              if (peerID === localPeerID) return '';
              
              var unreadCount = 0;
              var hasMessages = false;
              if (this.exists(messages[peerID])) {
                hasMessages = true;
                unreadCount = messages[peerID].filter((message) => peerID === message.fromPeerID ? message.seen === false : false).length;
              }

              return (
                <ListItem dense button selected={selectedRemotePeerID === peerID} onClick={(event) => this.handleRemotePeerChange(event, peerID)}>
                {this.exists(connections[peerID]) ? 
                  <>
                  <ListItemIcon>
                    <FiberManualRecordIcon fontSize='small' style={{color: 'green'}} />
                  </ListItemIcon>
                  <ListItemText primary={peerID} />
                  {hasMessages ? <Badge badgeContent={unreadCount} color="secondary"><CommentIcon fontSize='small' color='primary' /></Badge> : ''} 
                  </>: 
                  <ListItemText primary={peerID} />
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