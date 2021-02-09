import React, { Component } from 'react'
import moment from 'moment'
import Dexie from 'dexie';
import { connect } from 'react-redux';

import { Message } from '../App.config';
import { dataURItoBlob } from '../App.fn'

import { ListItem, Grid } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';


type MessagesProps = {
  messages: Message[],
  localUsername: string,
  remoteUsername: string,
  db: Dexie,
  dispatch: any
}

/************************************************************************
 * 
 */
class MessagesDisplay extends Component<MessagesProps> {

  private chatWindowRef : React.RefObject<HTMLDivElement>|null  = React.createRef();

  constructor(props: MessagesProps) {

    super(props);
  
  }

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

  render() {

    return (
      <>
      {this.props.messages.map((message: Message, index: number) => {
        let attachment: false|Blob|string = message.attachment;
        if (attachment) attachment = dataURItoBlob(attachment);
        
        return (
          <ListItem dense key={`${JSON.stringify(message)}-${index}`}>
            <Grid container justify="flex-start" direction="row">
              <Grid item xs={1}><AccountCircleIcon style={{float: 'left'}} color={message.from === this.props.localUsername ? 'disabled':'secondary'} fontSize={'large'} /></Grid>
              <Grid item xs={11} className={'messageDisplaycontainer'}>
                <div>
                  <span className='messageDisplayName'>{message.from}</span>
                  <span className='messageDisplayTS'>{moment(message.timestamp).format('M/D/YY h:mm a')}</span>
                </div>
                <div className='messageDisplayMSG'>
                  <div>{message.image ? <img style={{margin: 'auto', display: 'block', width: '99%', maxWidth: '250px'}} src={message.image}></img> : <></>}</div>
                  <div>{typeof attachment === 'object' ? <div><a target='_blank' href={URL.createObjectURL(attachment)}>attachment</a> ({attachment.type}) ({attachment.size} bytes)</div> : <div></div>}</div>
                  <div>{message.text}</div>
                </div>  
              </Grid>
            </Grid>
          </ListItem>
        );
      })}
      <div ref={this.chatWindowRef}></div>
      </>
    );
  }

}



export default connect()(MessagesDisplay);