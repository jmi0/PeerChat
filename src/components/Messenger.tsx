/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 11:07:36 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-11 18:04:41
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DataConnection } from 'peerjs';
import { Picker } from 'emoji-mart'
import moment from 'moment';
import CryptoJS from 'crypto-js';


import { updateMessages } from '../actions';
import APP_CONFIG, { Message, MessengerProps, MessengerState } from '../App.config';
import { exists } from '../App.fn'

import SendSharpIcon from '@material-ui/icons/SendSharp';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import AttachFileOutlinedIcon from '@material-ui/icons/AttachFileOutlined';
import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import { Box, IconButton } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css'


/**
 * Handles sending/displaying messages, attachments, images, emojis
 * 
 * @param props : MessengerProps
 */
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
    // create connection
    this.setUpConnection();
    // create listener to know when user blurs emoji picker
    document.addEventListener("click", this.handleEmojiPickerBlur, false);
  }

  componentDidUpdate(prevProps: MessengerProps) {
    // send profile to selected user if profile changes
    if (JSON.stringify(prevProps.userProfile) !== JSON.stringify(this.props.userProfile)) {
      if (this.state.connection) this.state.connection.send({user_profile: this.props.userProfile});
    }
      
  }

  componentWillUnmount() {
    // remove emoji blur listener
    document.removeEventListener('click', this.handleEmojiPickerBlur, false);
    // close connection if exists/open
    if (this.state.connection) this.state.connection.close();
  }

  /**
   * Creates connection and associated event listeners
   */
  setUpConnection() {
    
    // return if there is no remote peer id
    if (!this.props.remotePeerID) return;
    
    // create connection
    let conn: DataConnection = this.props.peer.connect(this.props.remotePeerID, {serialization: 'json'});
    
    /**
     * connection opened
     */
    conn.on('open', () => {
      console.log(`Connected to ${this.props.selectedUser.username}`);
      let encrypted_profile = CryptoJS.AES.encrypt(JSON.stringify({user_profile: this.props.userProfile}), `${this.props.selectedUser.username}-${APP_CONFIG.CLIENT_KEY}`).toString();
      // atttempt to send user profile on connection to give recipient additonal information on user
      if (this.props.userProfile) conn.send(encrypted_profile);
      // update state connection whenever it opens
      this.setState({connection: conn});
    });

    /**
     * incoming data
     */
    conn.on('data', (data) => {
      console.log(`We are not processing incoming data here, only sending`, data);
    });
    

    // on connection error
    conn.on('error', function(err) {
      console.log(err);
    });
      
    // on disconnect
    conn.on('disconnected', () => {
      console.log(`Disconnected from ${this.props.selectedUser.username}`);
    });
      
    // on close
    conn.on('close', () => {
      console.log(`Connection closed from ${this.props.selectedUser.username}`);
    });
  }


  /**
   * Create a valid message of Message type
   * 
   * @param text 
   * @param image 
   * @param attachment 
   * @param sent 
   * @param seen 
   */
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

  /**
   * event handler for send button
   * 
   * @param event : React.MouseEvent
   */
  handleSendButton = (event: React.MouseEvent) => {
    this.sendMessage(this.createMessage(this.state.text, this.state.image, this.state.attachment));
  }


  /**
   * Key event handler for sending with 'Enter' key
   * 
   * @param event : React.KeyboardEvent
   */
  handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13) {
      (event.target as HTMLInputElement).blur();
      // send
      this.sendMessage(this.createMessage(this.state.text, this.state.image, this.state.attachment));
    }
  }

  /**
   * Send a '👍'
   * 
   * @param event : React.MouseEvent
   */
  sendThumbsUp = (event: React.MouseEvent) => {
    this.sendMessage(this.createMessage('👍'));                                                                   
  }

  /**
   * handle text area input message change
   * 
   * @param event : React.ChangeEvent
   */
  handleMessageChange = (event: React.ChangeEvent) => {
    this.setState({ text: (event.target as HTMLInputElement).value });
  }

  /**
   * Handle file/attachment/image change
   * 
   * @param event : any
   */
  handleFile = (event: any) => {
    
    const reader = new FileReader();
    const name = event.target.name;
    const file = event.target.files[0];

    // dont allow files larger than 400000 bytes
    if (exists(file.size) && file.size > 400000) return;
    
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (name === 'image') this.setState({ image: reader.result });
        else this.setState({ attachment: reader.result });
      }
    }
    reader.readAsDataURL(file);
    
  };

  /**
   * Handle emoji picker blur to close emoji picker
   * 
   * @param event : any
   */
  handleEmojiPickerBlur = (event: any) => {
    if (this.emojiPickerRef.current && !this.emojiPickerRef.current?.contains(event.target)) this.setState({ emojiPickerOpen: false });
  }


  /**
   * toggle emoji picker state
   * 
   * @param event : React.MouseEvent
   */
  toggleEmojiPicker = (event: React.MouseEvent) => {
    if (this.state.emojiPickerOpen) this.setState({emojiPickerOpen: false}); 
    else this.setState({emojiPickerOpen: true});
  };

  /**
   * append emoji to text state
   * 
   * @param event : any
   */
  handleEmojiPicker = (event: any) => {
    let emojiText = this.state.text;
    this.setState({ text: emojiText += event.native});
  };


  /**
   * Send and update message in db and redux store
   * 
   * @param message : Message
   */
  sendMessage = (message: Message) => {

    // abort if nothing to send
    if (!message.text && !message.image && !message.attachment) return;

    // only actually send and update sent state if connection state is open
    if (this.state.connection && this.state.connection?.open) {
      message.sent = true;
      // encrypt
      let encrypted_message = CryptoJS.AES.encrypt(JSON.stringify({message: message}), `${message.to}-${APP_CONFIG.CLIENT_KEY}`).toString();
      //this.state.connection.send({message: message});
      this.state.connection.send(encrypted_message);
    }
    // create key and put in databse
    message.groupkey = `${this.props.systemUser.username}-${this.props.selectedUser.username}`;
    this.props.db.table('messages').put(message).then((id) => {
      // dispatch new message to redux store
      this.props.dispatch(updateMessages(this.props.selectedUser.username, message));
    });
    // reset message state
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

