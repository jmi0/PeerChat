import React, { useEffect, useState, useRef } from 'react'
import { updateOnline } from '../actions';
import { connect } from 'react-redux';
import { Message, User } from '../App.config';
import SendSharpIcon from '@material-ui/icons/SendSharp';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import AttachFileOutlinedIcon from '@material-ui/icons/AttachFileOutlined';
import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import { Box, IconButton } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
 



type MessengerProps = {

}


const Messenger: React.FC<MessengerProps> = (props: MessengerProps) => {
  
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState<string>('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<boolean>(false);


  useEffect(() => {

    document.addEventListener("click", handleEmojiPickerBlur, false);

    return () => {
      // unmounting
      document.removeEventListener('click', handleEmojiPickerBlur, false);
    }

  }, []);

  
  const handleSendButton = (event: React.MouseEvent) => {
    sendMessage(text);
  }


  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13) {
      (event.target as HTMLInputElement).blur();
      
      // send
      sendMessage(text);
      
    }
  }


  const handleMessageChange = (event: React.ChangeEvent) => {
    setText((event.target as HTMLInputElement).value);
  }


  const handleEmojiPickerBlur = (event: any) => {
    if (emojiPickerRef.current && !emojiPickerRef.current?.contains(event.target)) setEmojiPickerOpen(false);
  }


  const handleEmojiPicker = (event: React.MouseEvent) => {
    if (emojiPickerOpen) setEmojiPickerOpen(false);
    else setEmojiPickerOpen(true);
  };


  const sendMessage = (message: any) => {
    // send
    setText('');
    console.log(`actually send`, message);
  }



  return (
    <Box id='text-send-container'>
      <div id='message-textarea-container'><textarea placeholder='Type message here...' value={text} onChange={handleMessageChange} onKeyDown={handleKeyDown} rows={2}></textarea></div>
      <div id='message-btn-container'>
        <IconButton onClick={() => {imageInputRef.current?.click();}}><ImageOutlinedIcon /><input ref={imageInputRef} style={{display:'none'}} type={"file"} accept={'.jpg,.jpeg,.png,.gif'} /></IconButton> 
        <IconButton onClick={() => {fileInputRef.current?.click();}}><AttachFileOutlinedIcon /><input ref={fileInputRef} style={{display:'none'}} type={"file"} /></IconButton>
        <span ref={emojiPickerRef}>
          <IconButton onClick={handleEmojiPicker}><EmojiEmotionsOutlinedIcon /></IconButton>
          {emojiPickerOpen ? <Picker onClick={(event) => {console.log(event);}} />:<></>}
        </span>
        <IconButton onClick={(event) => {sendMessage('👍');}}><ThumbUpAltOutlinedIcon /></IconButton>
        <IconButton color="primary" id='send-icon' onClick={handleSendButton}><SendSharpIcon /></IconButton>
      </div>
    </Box>
  );

}

export default connect()(Messenger);

