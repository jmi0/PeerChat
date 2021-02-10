import React, { Component } from 'react';
import { connect } from 'react-redux';
import Peer, { DataConnection } from 'peerjs';
import { Picker } from 'emoji-mart'
import moment from 'moment';
import Dexie from 'dexie'

import { updateMessages } from '../actions';
import { Message, User, UserProfile } from '../App.config';
import { exists } from '../App.fn'

import SendSharpIcon from '@material-ui/icons/SendSharp';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import AttachFileOutlinedIcon from '@material-ui/icons/AttachFileOutlined';
import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import { Box, IconButton } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css'


type MessengerProps = {
  peer: Peer,
  remotePeerID: string|false,
  selectedUser: User,
  systemUser: User,
  userProfile: UserProfile|false,
  db: Dexie,
  dispatch: any
}

type MessengerState = {
  connection: DataConnection|false,
  text: string,
  image: string|false,
  attachment: string|false,
  emojiPickerOpen: boolean
}

class Messenger extends Component<MessengerProps, MessengerState> {

  private emojiPickerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private fileInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  private imageInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  constructor(props: MessengerProps) {

    super(props);

    this.state = {
      connection: false,
      text: '',
      image: false,
      attachment: false,
      emojiPickerOpen: false
    }

  }

  componentDidMount() {
    this.setUpConnection();
    document.addEventListener("click", this.handleEmojiPickerBlur, false);
  }

  componentDidUpdate(prevProps: MessengerProps) {
    if (JSON.stringify(prevProps.userProfile) !== JSON.stringify(this.props.userProfile)) {
      if (this.state.connection) this.state.connection.send({user_profile: this.props.userProfile});
    }
      
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleEmojiPickerBlur, false);
    if (this.state.connection) this.state.connection.close();
  }

  setUpConnection() {
    
    if (!this.props.remotePeerID) return;
    
    let conn: DataConnection = this.props.peer.connect(this.props.remotePeerID, {serialization: 'json'});
    
    conn.on('open', () => {
      console.log(`Connected to ${this.props.selectedUser.username}`);
      // atttempt to send user profile on connection to give recipient additonal information on user
      if (this.props.userProfile) conn.send({user_profile: this.props.userProfile});
      
      this.setState({connection: conn});
    });

    conn.on('data', (data) => {
      data.message.groupkey = `${data.message.to}-${data.message.from}`;
      if (this.props.selectedUser.username === data.message.from) data.message.seen = true;
      this.props.db.table('messages').put(data.message).then((id) => {
        this.props.dispatch(updateMessages(data.message.from, data.message));
      }).catch((err) => {
        console.log(err);
      });
    });
    
    conn.on('error', function(err) {
      console.log(err);
    });
      
    conn.on('disconnected', () => {
      console.log(`Disconnected from ${this.props.selectedUser.username}`);
    });
      
    conn.on('close', () => {
      console.log(`Connection closed from ${this.props.selectedUser.username}`);
    });
  }

  createMessage = (text='', image:string|false=false, attachment:string|false=false, sent=false, seen=false) : Message => {
    return {
      sent: sent,
      seen: seen,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      from: this.props.systemUser.username,
      to: this.props.selectedUser.username,
      text: text,
      image: image,
      attachment: attachment
    };
  }

  
  handleSendButton = (event: React.MouseEvent) => {
    this.sendMessage(this.createMessage(this.state.text, this.state.image, this.state.attachment));
  }


  handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13) {
      (event.target as HTMLInputElement).blur();
      // send
      this.sendMessage(this.createMessage(this.state.text, this.state.image, this.state.attachment));
    }
  }

  sendThumbsUp = (event: React.MouseEvent) => {
    this.sendMessage(this.createMessage('👍'));                                                                   
  }


  handleMessageChange = (event: React.ChangeEvent) => {
    this.setState({ text: (event.target as HTMLInputElement).value });
  }

  handleFile = (event: any) => {
    
    const reader = new FileReader();
    const name = event.target.name;
    const file = event.target.files[0];

    if (exists(file.size) && file.size > 400000) return;
    
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (name === 'image') this.setState({ image: reader.result });
        else this.setState({ attachment: reader.result });
      }
    }
    reader.readAsDataURL(file);
    
  };

  handleEmojiPickerBlur = (event: any) => {
    if (this.emojiPickerRef.current && !this.emojiPickerRef.current?.contains(event.target)) this.setState({ emojiPickerOpen: false });
  }


  toggleEmojiPicker = (event: React.MouseEvent) => {
    if (this.state.emojiPickerOpen) this.setState({emojiPickerOpen: false}); 
    else this.setState({emojiPickerOpen: true});
  };

  handleEmojiPicker = (event: any) => {
    let emojiText = this.state.text;
    this.setState({ text: emojiText += event.native});
  };


  sendMessage = (message: Message) => {

    if (!message.text && !message.image && !message.attachment) return;

    if (this.state.connection && this.state.connection?.open) {
      message.sent = true;
      this.state.connection.send({message: message});
    }
    message.groupkey = `${this.props.systemUser.username}-${this.props.selectedUser.username}`;
    this.props.db.table('messages').put(message).then((id) => {
      this.props.dispatch(updateMessages(this.props.selectedUser.username, message));
    });
    this.setState({text:'', image: false, attachment: false});
  }

  render() {
    const { image, text, emojiPickerOpen } = this.state;
    return (
      <Box id='text-send-container'>
        {image ? <div><img alt={`preview`} width={'60px'} src={image}></img></div> : <></>}
        <div id='message-textarea-container'><textarea placeholder='Type message here...' value={text} onChange={this.handleMessageChange} onKeyDown={this.handleKeyDown} rows={2}></textarea></div>
        <div id='message-btn-container'>
          <IconButton onClick={() => {this.imageInputRef.current?.click();}}><ImageOutlinedIcon /><input name='image' ref={this.imageInputRef} style={{display:'none'}} type={"file"} accept={'.jpg,.jpeg,.png,.gif'} onChange={this.handleFile} /></IconButton> 
          <IconButton onClick={() => {this.fileInputRef.current?.click();}}><AttachFileOutlinedIcon /><input name='attachement'  ref={this.fileInputRef} style={{display:'none'}} type={"file"} onChange={this.handleFile} /></IconButton>
          <span ref={this.emojiPickerRef}>
            <IconButton onClick={this.toggleEmojiPicker}><EmojiEmotionsOutlinedIcon /></IconButton>
            <Picker style={{display: (emojiPickerOpen ? 'block' : 'none')}} onSelect={this.handleEmojiPicker} />
          </span>
          <IconButton onClick={this.sendThumbsUp}><ThumbUpAltOutlinedIcon /></IconButton>
          <IconButton color="primary" id='send-icon' onClick={this.handleSendButton}><SendSharpIcon /></IconButton>
        </div>
      </Box>
    );
  }

}


export default connect()(Messenger);

