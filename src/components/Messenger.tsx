import React, { useEffect, useState, useRef } from 'react'
import { updateOnline } from '../actions';
import { connect } from 'react-redux';
import { Message, User } from '../App.config';
import { exists } from '../App.fn'
import Peer, { DataConnection } from 'peerjs';
import SendSharpIcon from '@material-ui/icons/SendSharp';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import AttachFileOutlinedIcon from '@material-ui/icons/AttachFileOutlined';
import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import { Box, IconButton } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import moment from 'moment';
import Dexie from 'dexie'



type MessengerProps = {
  peer: Peer,
  selectedUser: User,
  systemUser: User,
  db: Dexie
}


const Messenger: React.FC<MessengerProps> = (props: MessengerProps) => {
  
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [ connection, setConnection ] = useState<DataConnection|false>(false);
  const [ text, setText ] = useState<string>('');
  const [ emojiPickerOpen, setEmojiPickerOpen ] = useState<boolean>(false);


  useEffect(() => {

    let conn: DataConnection = props.peer.connect(props.selectedUser.peerID, {serialization: 'json'});

    conn.on('open', () => {
      console.log(`Connected to ${props.selectedUser.username}`);
      setConnection(conn);
    });

    conn.on('data', (data) => {
      console.log(data);
    });
  
    conn.on('error', function(err) {
      console.log(err);
    });
    
    conn.on('disconnected', () => {
      console.log(`Disconnected from ${props.selectedUser.username}`);
    });
    
    
    document.addEventListener("click", handleEmojiPickerBlur, false);

    return () => {
      // unmounting
      document.removeEventListener('click', handleEmojiPickerBlur, false);
      if (connection) connection.close();
    }

  }, []);

  
  const handleSendButton = (event: React.MouseEvent) => {
    sendMessage({
      sent: true,
      seen: false,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      from: props.systemUser.username,
      to: props.selectedUser.username,
      text: text,
      image: false,
      attachment: false
    });
  }


  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13) {
      (event.target as HTMLInputElement).blur();
      
      // send
      sendMessage({
        sent: true,
        seen: false,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        from: props.systemUser.username,
        to: props.selectedUser.username,
        text: text,
        image: false,
        attachment: false
      });
      
    }
  }

  const sendThumbsUp = (event: React.MouseEvent) => {
    sendMessage({
      sent: false,
      seen: false,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      from: props.systemUser.username,
      to: props.selectedUser.username,
      text: '👍',
      image: false,
      attachment: false
    });                                                                     
  }


  const handleMessageChange = (event: React.ChangeEvent) => {
    setText((event.target as HTMLInputElement).value);
  }


  const handleEmojiPickerBlur = (event: any) => {
    if (emojiPickerRef.current && !emojiPickerRef.current?.contains(event.target)) setEmojiPickerOpen(false);
  }


  const toggleEmojiPicker = (event: React.MouseEvent) => {
    if (emojiPickerOpen) setEmojiPickerOpen(false);
    else setEmojiPickerOpen(true);
  };

  const handleEmojiPicker = (event: any) => {
    let emojiText = text;
    setText(emojiText += event.native);
  };


  const sendMessage = (message: Message) => {
    // send
    if (connection && connection?.open) {
      message.sent = true;
      connection.send({message: message});
    }
    props.db.table('messages').add(message);
    setText('');
  }



  return (
    <Box id='text-send-container'>
      <div id='message-textarea-container'><textarea placeholder='Type message here...' value={text} onChange={handleMessageChange} onKeyDown={handleKeyDown} rows={2}></textarea></div>
      <div id='message-btn-container'>
        <IconButton onClick={() => {imageInputRef.current?.click();}}><ImageOutlinedIcon /><input ref={imageInputRef} style={{display:'none'}} type={"file"} accept={'.jpg,.jpeg,.png,.gif'} /></IconButton> 
        <IconButton onClick={() => {fileInputRef.current?.click();}}><AttachFileOutlinedIcon /><input ref={fileInputRef} style={{display:'none'}} type={"file"} /></IconButton>
        <span ref={emojiPickerRef}>
          <IconButton onClick={toggleEmojiPicker}><EmojiEmotionsOutlinedIcon /></IconButton>
          {emojiPickerOpen ? <Picker onSelect={handleEmojiPicker} />:<></>}
        </span>
        <IconButton onClick={sendThumbsUp}><ThumbUpAltOutlinedIcon /></IconButton>
        <IconButton color="primary" id='send-icon' onClick={handleSendButton}><SendSharpIcon /></IconButton>
      </div>
    </Box>
  );

}

export default connect()(Messenger);

