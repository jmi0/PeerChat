/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 11:08:04 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:37:59
 */

import React, { useState } from 'react'
import { connect } from 'react-redux';
import { Container, Box, TextField, Button } from '@material-ui/core';

/**
 * Login form display and handling
 * 
 * @param props : any
 */
const LoginForm: React.FC = (props: any) => {
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  /**
   * Handler for text input changes
   * 
   * @param event : React.ChangeEvent<HTMLInputElement>
   */
  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'username') setUsername(event.target.value);
    else if (event.target.name === 'password') setPassword(event.target.value);
  }
  
  /**
   * event handler to trigger login
   * 
   * @param e : React.SyntheticEvent
   */
  const submitLogin = (e: React.SyntheticEvent) => {
    login(username, password);
    e.preventDefault();
  };

  /**
   * fetch login post to server
   * 
   * @param username : string
   * @param password : string
   */
  const login = (username: string, password: string) => {
    
    fetch('/login', { 
      method: 'POST', 
      body: JSON.stringify({ 
        username: username, 
        password: password 
      }), 
      headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      if (typeof result.success !== 'undefined') {
        // redirect to main page on login success
        window.location.href = '/';
      } else {
        // TODO :
        // form handling (bad login)
        console.log(result);
      }
    })
    .catch(error => {
      // TODO:
      // form handling (request error)
      console.error('Error:', error);
    });

  }

  return (
    <Container>
      <h2>Login</h2>
      <hr />
      <Box m={2}>
        <form onSubmit={submitLogin}>
          <Box pt={2} >
            <TextField required value={username} name="username" onChange={handleFormFieldChange} variant="outlined" label="username" type="text"  />
          </Box>
          <Box pt={2}>
            <TextField required value={password} name="password" onChange={handleFormFieldChange} variant="outlined" label="password" type="password" />
          </Box>
          <Box pt={2}>
            <Button type='submit' size="large" variant="contained" color="primary">Login</Button>
          </Box>
        </form>
        <Box mt={2}><small>Click <a href='/signup'>here</a> to register</small></Box>
      </Box>  
    </Container>
  );

}

export default connect()(LoginForm);

