import React, { Component } from 'react'
import moment from 'moment'
import Dexie from 'dexie';
import { connect } from 'react-redux';

import { Message, UserProfile } from '../App.config';
import { dataURItoBlob, exists } from '../App.fn'

import { ListItem, Avatar, Box } from '@material-ui/core';


type MessagesProps = {
  messages: Message[],
  localUsername: string,
  remoteUsername: string,
  localProfile: UserProfile|false,
  remoteProfile: UserProfile|false,
  db: Dexie,
  dispatch: any
}

/************************************************************************
 * 
 */
class MessagesDisplay extends Component<MessagesProps> {

  private chatWindowRef : React.RefObject<HTMLDivElement>|null  = React.createRef();

  componentDidMount() {
    this.scrollToBottom('auto');
  }
  
  componentDidUpdate() {
    this.scrollToBottom('smooth');
  }

  shouldComponentUpdate(nextProps: MessagesProps) {
    if (this.props.remoteUsername !== nextProps.remoteUsername) return true;
    if (this.props.messages.length !== nextProps.messages.length) return true;
    else return false;
  }

  scrollToBottom = (behavior: 'auto'|'smooth') => {
    if (this.chatWindowRef !== null && this.chatWindowRef.current !== null) {
      this.chatWindowRef.current.scrollIntoView({ behavior: behavior });
    }
  };

  getAvatar(username: string) {
    var profile = this.props.localProfile;
    if (username === this.props.remoteUsername) profile = this.props.remoteProfile;
    console.log(profile);
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