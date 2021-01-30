import React, { Component } from 'react'
import moment from 'moment'
import { ListItem, Grid } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { connect } from 'react-redux';
import { Message } from '../App.config';
import Dexie from 'dexie';
import { updateMessages } from '../actions';


export type MessagesProps = {
  messages: Message[],
  localUsername: string,
  remoteUsername: string,
  lastMessage: Message|Object,
  db: Dexie,
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
      messages: this.props.messages
    }
  }

  componentDidMount() {
    /*
    this.props.db.table('messages').where('groupkey').equals(`${this.props.remoteUsername}${this.props.localUsername}`).sortBy('timestamp').then((messages: Message[]) => {
      this.setState({messages: messages});
    }).finally(() => {
      this.scrollToBottom('auto');
    });
    */
   this.scrollToBottom('auto');
  }
  /*
  shouldComponentUpdate (nextProps: MessagesProps) {
    // optimization so we only rerender if a message is added
    return (
      (this.props.lastMessage !== nextProps.lastMessage) || 
      (this.props.remoteUsername !== nextProps.remoteUsername)
    );
  }
  */
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
        return (
          <ListItem dense key={`${JSON.stringify(message)}-${index}`}>
            <Grid container justify="flex-start" direction="row">
              <Grid item xs={1}><AccountCircleIcon style={{float: 'left'}} color={message.from === this.props.localUsername ? 'disabled':'secondary'} fontSize={'large'} /></Grid>
              <Grid item xs={11} className={'messageDisplaycontainer'}>
                <div>
                  <span className='messageDisplayName'>{message.from}</span>
                  <span className='messageDisplayTS'>{moment(message.timestamp).format('M/D/YY h:mm a')}</span>
                </div>
                <div className='messageDisplayMSG'>{message.text}</div>  
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