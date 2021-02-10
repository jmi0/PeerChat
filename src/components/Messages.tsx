/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 11:07:59 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:38:40
 */

import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux';

import { Message, MessagesProps } from '../App.config';
import { dataURItoBlob, exists } from '../App.fn'

import { ListItem, Avatar, Box } from '@material-ui/core';


/**
 * Displays messages in a chat session
 * 
 * @param props: MessagesProps
 */
class MessagesDisplay extends Component<MessagesProps> {

  // ref to refernce bottom of messages for auto scrolling
  private chatWindowRef : React.RefObject<HTMLDivElement>|null  = React.createRef();


  componentDidMount() {
    // auto scroll to bottom of messages on mount
    this.scrollToBottom('auto');
  }
  
  componentDidUpdate() {
    // auto scroll to bottom of messages on update
    this.scrollToBottom('smooth');
  }

  /**
   * optimize component updates
   * 
   * @param nextProps : MessagesProps
   */
  shouldComponentUpdate(nextProps: MessagesProps) {
    // only update messages if user or messages props change
    if (this.props.remoteUsername !== nextProps.remoteUsername) return true;
    if (this.props.messages.length !== nextProps.messages.length) return true;
    else return false;
  }

  /**
   * Scroll to chat window ref
   * 
   * @param behavior : 'auto'|'smooth'
   */
  scrollToBottom = (behavior: 'auto'|'smooth') => {
    if (this.chatWindowRef !== null && this.chatWindowRef.current !== null) {
      this.chatWindowRef.current.scrollIntoView({ behavior: behavior });
    }
  };

  /**
   * Get/create avatar from username
   * 
   * @param username : string
   */
  getAvatar(username: string) {
    var profile = this.props.localProfile;
    if (username === this.props.remoteUsername) profile = this.props.remoteProfile;
    if (profile && exists(profile.profilepic)) return (<Avatar><img alt={`${username}-avatar`} width='100%' src={profile.profilepic}></img></Avatar>);
    else return (<Avatar color={username === this.props.localUsername ? 'disabled':'secondary'}>{username.charAt(0)}</Avatar>);
  }

  render() {

    return (
      <>
      {this.props.messages.map((message: Message, index: number) => {
        let attachment: false|Blob|string = message.attachment;
        if (attachment) attachment = dataURItoBlob(attachment);
        
        return (
          <ListItem dense key={`${JSON.stringify(message)}-${index}`}>
            <Box display="flex" flexDirection="row">
              <Box pr={2}>{this.getAvatar(message.from)}</Box>
              <Box className={'messageDisplaycontainer'}>
                <div>
                  <span className='messageDisplayName'>{message.from}</span>
                  <span className='messageDisplayTS'>{moment(message.timestamp).format('M/D/YY h:mm a')}</span>
                </div>
                <div className='messageDisplayMSG'>
                  <div>{message.image ? <img alt={`attachment`} style={{margin: 'auto', display: 'block', width: '99%', maxWidth: '250px'}} src={message.image}></img> : <></>}</div>
                  <div>{typeof attachment === 'object' ? <div><a target='_blank' rel="noreferrer" href={URL.createObjectURL(attachment)}>attachment</a> ({attachment.type}) ({attachment.size} bytes)</div> : <div></div>}</div>
                  <div>{message.text}</div>
                </div>  
              </Box>
            </Box>
          </ListItem>
        );
      })}
      <div ref={this.chatWindowRef}></div>
      </>
    );
  }

}



export default connect()(MessagesDisplay);