import { Component } from 'react'
import Peer from 'peerjs' 
import moment from 'moment';
import { Button, Select, TextareaAutosize  } from '@material-ui/core';

type ChatProps = {
  localPeer: Peer
}
interface Message {
  message: string,
  fromPeerID: string,
  toPeerID: string,
  timestamp: moment.Moment
}
interface remotePeerConnections {
  [key: string]: {connection: any, messages: Message[]}
}

type ChatState = {
  remotePeers: Object,
  localPeer: Peer,
  localPeerID: string,
  selectedRemotePeerID: string,
  textMessage: string,
  remotePeerConnections: remotePeerConnections
}

class Chat extends Component<ChatProps, ChatState> {


  private updateRemotePeersInterval : number = 0;

  
  constructor(props: ChatProps | Readonly<ChatProps>) {

    super(props);

    this.state = {
      remotePeers: {},
      localPeer: this.props.localPeer,
      localPeerID: '',
      selectedRemotePeerID: '',
      textMessage: '',
      remotePeerConnections: {}
    };

    this.handleRemotePeerChange = this.handleRemotePeerChange.bind(this);
    this.connectToPeer = this.connectToPeer.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
  }

  componentDidMount() {
    
 
    this.state.localPeer.on('open', (peerid) => {
      console.log(`My Peer ID is ${peerid}`);
      this.setState({localPeerID: peerid});
    });

    this.state.localPeer.on('connection', (conn) => {
      // listen for connections
      
      conn.on('data', (data) => {
        this.updateRemotePeerMessages(conn.peer, this.state.localPeerID, data);
        console.log(conn.peer, this.state.remotePeerConnections[conn.peer].messages);
      });

      conn.on('open', () => {
        this.updateRemotePeerConnections(conn.peer, conn);
        console.log(`Connection opened with ${conn.peer}`);
      });
    });

    
    
    

    this.getRemotePeers();
    this.updateRemotePeersInterval = window.setInterval(() => {
      this.getRemotePeers();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.updateRemotePeersInterval);
  }

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

  handleRemotePeerChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({selectedRemotePeerID: (event.target as HTMLInputElement).value});
    this.connectToPeer((event.target as HTMLInputElement).value);
  }

  updateRemotePeerConnections(remotePeerID: string, conn: Object) {

    let remotePeerConnections = this.state.remotePeerConnections;

    let peerMessages : Message[] = [];
    if (typeof remotePeerConnections[remotePeerID] !== 'undefined' && typeof remotePeerConnections[remotePeerID].messages !== 'undefined') 
      peerMessages = remotePeerConnections[remotePeerID].messages;
    
    let peerConnection = {connection: conn, messages: peerMessages};
    
    remotePeerConnections[remotePeerID] = peerConnection;
    this.setState({remotePeerConnections: remotePeerConnections});
  }

  updateRemotePeerMessages(fromPeerID: string, toPeerID: string, textMessage: string) {
    
    let remotePeerConnections = this.state.remotePeerConnections;
    let remotePeerID = '';
    if (this.state.localPeerID === fromPeerID) remotePeerID = toPeerID;
    else remotePeerID = fromPeerID;

    if (typeof this.state.remotePeerConnections[remotePeerID] === 'undefined') return;

    let peerMessages: Message[] = [];
    if (typeof remotePeerConnections[remotePeerID].messages !== 'undefined') 
      peerMessages = remotePeerConnections[remotePeerID].messages;
    
    peerMessages.push({message: textMessage, timestamp: moment(), fromPeerID: fromPeerID, toPeerID: toPeerID});
    let peerConnection = {connection: remotePeerConnections[remotePeerID].connection, messages: peerMessages};
    remotePeerConnections[remotePeerID] = peerConnection;
    this.setState({remotePeerConnections: remotePeerConnections});
  }

  connectToPeer(remotePeerID: string) {
    
    var conn = this.props.localPeer.connect(remotePeerID);
    conn.on('open', () => {
      this.updateRemotePeerConnections(remotePeerID, conn);
      console.log(`Connection opened with ${remotePeerID}`);
    });
    conn.on('error', function(err) { console.log(err); });
    
  }

  sendMessage = (event: React.MouseEvent) => {
    this.state.remotePeerConnections[this.state.selectedRemotePeerID].connection.send(this.state.textMessage);
    this.updateRemotePeerMessages(this.state.localPeerID, this.state.selectedRemotePeerID, this.state.textMessage);
    this.setState({textMessage: ''});
    console.log(this.state.selectedRemotePeerID, this.state.remotePeerConnections[this.state.selectedRemotePeerID].messages);
  }

  handleMessageChange = (event: React.ChangeEvent) => {
    this.setState({textMessage: (event.target as HTMLInputElement).value});
  }

  




  /*****************************************************************************
  *****************************************************************************/
  render() {
    const { remotePeers, localPeerID, remotePeerConnections, textMessage, selectedRemotePeerID } = this.state;
    
    return (
      <div>
        
        <Select multiple native onChange={this.handleRemotePeerChange}>
          {Object.keys(remotePeers).map((peerID) => {
            if (peerID !== localPeerID) return <option key={`peerOption-${peerID}`} value={peerID}>{peerID}</option>  
            else return '';
          })}
        </Select>
        <div>
        {typeof(remotePeerConnections[selectedRemotePeerID]) !== 'undefined' && typeof(remotePeerConnections[selectedRemotePeerID].messages) !== 'undefined' ?
          <>
          {remotePeerConnections[selectedRemotePeerID].messages.map((message) => {
            
            return <div key={JSON.stringify(message)}><b>{message.fromPeerID} ({message.timestamp.format('M/D/YY h:mm a')})</b>: {message.message}</div>
          })}
          </> : ''
        }
        </div>
        {typeof(remotePeerConnections[selectedRemotePeerID]) !== 'undefined' ?
        <div>
          <TextareaAutosize rowsMin={3} value={textMessage} onChange={this.handleMessageChange} />
          <Button variant="contained" color='primary' onClick={this.sendMessage}>Send</Button>
        </div> : ''
        }
       
      </div>
    );
  }

}


/*******************************************************************************
*******************************************************************************/


export default Chat;