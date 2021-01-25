import React, { useEffect, useState } from 'react'
import { updateOnline } from '../actions';
import { connect } from 'react-redux';
import { Box } from '@material-ui/core';
import { User } from '../App.config';

type TestProps = {
  user: User,
  token: string|false,
  dispatch: any
}



const Test: React.FC<TestProps> = (props: TestProps) => {
  
  props.dispatch(updateOnline({joe: {username: 'joe', peerID: ''}}));
  console.log(props);
  useEffect(() => {
    
  });

 
  return (
    <Box>
      {props.user.username} {props.token}
    </Box>
  );

}

export default connect()(Test);

