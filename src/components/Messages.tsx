import { Component } from 'react'
import moment from 'moment'
import { ListItem, Grid } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

interface Message {
  message: { username: string, message: string},
  from: string,
  timestamp: string,
  seen: Boolean
}

type MessagesProps = {
  messages: Message[],
  localUsername: string,
  lastMessage: Message|Object
}



/************************************************************************
 * 
 */
class MessagesDisplay extends Component<MessagesProps> {


  constructor(props: MessagesProps | Readonly<MessagesProps>) {

    super(props);

  }

  shouldComponentUpdate (nextProps: MessagesProps) {
    // optimization so we only rerender if a message is added
    return (this.props.lastMessage !== nextProps.lastMessage);
  }



  render() {
    return (
      <>
      {this.props.messages.map((message, index) => {
        return (
          <ListItem dense key={`${JSON.stringify(message)}-${index}`}>
            <Grid container justify="flex-start" direction="row">
              <Grid item xs={1}><AccountCircleIcon style={{float: 'left'}} color={message.from === this.props.localUsername ? 'primary':'secondary'} fontSize={'large'} /></Grid>
              <Grid item xs={11} className={'messageDisplaycontainer'}>
                <div>
                  <span className='messageDisplayName'>{message.from}</span>
                  <span className='messageDisplayTS'>{moment(message.timestamp).format('M/D/YY h:mm a')}</span>
                </div>
                <div className='messageDisplayMSG'>{message.message.message}</div>  
              </Grid>
            </Grid>
          </ListItem>
        );
      })}
      </>
    );
  }

}



export default MessagesDisplay;