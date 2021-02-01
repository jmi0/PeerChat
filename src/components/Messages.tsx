import React, { Component } from 'react'
import moment from 'moment'
import { ListItem, Grid } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { connect } from 'react-redux';
import { Message } from '../App.config';
import { dataURItoBlob } from '../App.fn'
import Dexie from 'dexie';
import { updateMessages } from '../actions';


export type MessagesProps = {
  messages: Message[],
  localUsername: string,
  remoteUsername: string,
  lastMessage: Message|Object,
  dispatch: any
}

export type MessagesState = {
  messages: Message[]
}

/************************************************************************
 * 
 */
class MessagesDisplay extends Component<MessagesProps, MessagesState> {

  private chatWindowRef : React.RefObject<HTMLDivElement>|null  = React.createRef();

  constructor(props: MessagesProps) {

    super(props);
    
    this.state = {
      messages: []
    }
  
  }

  componentDidMount() {
    this.setState({ messages: this.props.messages }, () => {
      this.scrollToBottom('auto');
    });
  }
  
  componentDidUpdate() {
    this.scrollToBottom('smooth');
  }

  scrollToBottom = (behavior: 'auto'|'smooth') => {
    if (this.chatWindowRef !== null && this.chatWindowRef.current !== null) {
      this.chatWindowRef.current.scrollIntoView({ behavior: behavior });
    }
  };


  render() {
    const { messages } = this.state;
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
                  <div>{message.image ? <img width={'100%'} src={message.image}></img> : <></>}</div>
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