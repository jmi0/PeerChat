import { Component } from 'react'
import Peer from 'peerjs' 
import moment from 'moment';
import { Box, Container, Button, TextareaAutosize, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
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
  toPeerID: string,
  timestamp: moment.Moment,
  seen: Boolean
}

interface Messages {
  [key: string]: Message[]
}

type ChatState = {
  remotePeers: Object,
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
      remotePeers: {},
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
  }

  componentDidMount() {
    
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
        this.updateRemotePeerMessages(conn.peer, this.state.localPeerID, data);
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
    fetch("/peers")
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

  
  handleRemotePeerChange = (event: React.MouseEvent, peerID: string) => {
    this.setState({selectedRemotePeerID: peerID});
    this.connectToPeer(peerID);
  }

  updateRemotePeerConnections(remotePeerID: string, conn: Object) {
    
    let connections: Connections = this.state.connections;
    connections[remotePeerID] = conn;
    this.setState({connections: connections});
    
  }

  updateRemotePeerMessages(fromPeerID: string, toPeerID: string, textMessage: string) {
    
    let remotePeerID: string = fromPeerID;

    if (this.state.localPeerID === fromPeerID) remotePeerID = toPeerID;
    
    let messages: Messages = this.state.messages;

    if (!this.exists(messages[remotePeerID])) messages[remotePeerID] = [];

    messages[remotePeerID].push({message: textMessage, timestamp: moment(), fromPeerID: fromPeerID, toPeerID: toPeerID, seen: false});
    
    this.setState({messages: messages});
  }

  connectToPeer(remotePeerID: string) {
    
    var conn = this.props.localPeer.connect(remotePeerID);
 
    conn.on('open', () => {
      //if (!this.exists(this.state.connections[remotePeerID])) conn.send(`<b>Connection opened with ${this.state.localPeerID}</b>`);
      this.updateRemotePeerConnections(remotePeerID, conn);
    });

    conn.on('data', (data) => {
      this.updateRemotePeerMessages(conn.peer, this.state.localPeerID, data);
      console.log(conn.peer, this.state.messages[conn.peer]);
    });
    
  }

  sendMessage = (event: React.MouseEvent) => {
    this.state.connections[this.state.selectedRemotePeerID].send(this.state.textMessage);
    this.updateRemotePeerMessages(this.state.localPeerID, this.state.selectedRemotePeerID, this.state.textMessage);
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
      <div>
      
          <h4>My Peer ID: {localPeerID}</h4>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <Box mx="auto" id='chat-window-container' >
                <List>
                  {this.exists(connections[selectedRemotePeerID]) ? 
                    <ListItem dense style={{color: 'green'}}>Connection opened with {selectedRemotePeerID}</ListItem> : 
                    <></>
                  }
                  {this.exists(messages[selectedRemotePeerID]) ?
                    <>
                    {messages[selectedRemotePeerID].map((message) => {
                      return (<ListItem dense key={JSON.stringify(message)}>
                        <AccountCircleIcon  color='secondary' />
                        <b>{message.fromPeerID} ({message.timestamp.format('M/D/YY h:mm a')})</b>: {message.message}
                        </ListItem>
                      );
                    })}
                    </> : ''
                  }
                </List>
                <Grid item xs={12}>
                  <Box pt={4} mx="auto">
                  {this.exists(connections[selectedRemotePeerID]) ?
                  <div id='text-send-container'>
                    <div><TextareaAutosize style={{width: '100%'}} rowsMin={3} value={textMessage} onChange={this.handleMessageChange} /></div>
                    <div><Button variant="contained" color='primary' onClick={this.sendMessage}>Send</Button></div>
                  </div> : ''
                  }
                  </Box>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box mx="auto">
                <List>
                  {(Object.keys(remotePeers).length < 2) ? 
                    <ListItem disabled>No Peers Available</ListItem>
                  :
                  <>
                  {Object.keys(remotePeers).map((peerID: string) => {
                    if (peerID === localPeerID) return '';
                    else return (
                      <ListItem dense button selected={selectedRemotePeerID === peerID} onClick={(event) => this.handleRemotePeerChange(event, peerID)}>
                        {this.exists(connections[peerID]) ? 
                          <>
                            <ListItemIcon>
                              <FiberManualRecordIcon fontSize='small' style={{color: 'green'}} />
                            </ListItemIcon>
                            <ListItemText primary={peerID} />
                            <CommentIcon fontSize='small' color='secondary' />
                          </>: 
                          <ListItemText primary={peerID} />
                        }
                      </ListItem>
                    )
                  })}
                  </>
                  }
                </List>
              </Box>
            </Grid>
          </Grid>
          
        
      </div>
    );
  }

}



export default Chat;