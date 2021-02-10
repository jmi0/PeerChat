/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 11:26:21 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:30:59
 */

import React, { useState } from 'react'
import { connect } from 'react-redux';
import { Container, Box, TextField, Button } from '@material-ui/core';

/**
 * Handle registration and signup fetch
 * 
 * @param props : any
 */
const RegisterForm: React.FC = (props: any) => {
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');

  /**
   * Handle input text change
   * 
   * @param event : React.ChangeEvent<HTMLInputElement>
   */
  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'username') setUsername(event.target.value);
    else if (event.target.name === 'password') setPassword(event.target.value);
    else if (event.target.name === 'repeatpassword') setRepeatPassword(event.target.value);
  }
  
  /**
   * Handle submit event
   * 
   * @param e : React.SyntheticEvent
   */
  const submitSignUp = (e: React.SyntheticEvent) => {
    // make sure password fields match
    if (password !== repeatPassword) console.log('dont submit');
    // signup fetch
    signup(username, password);
    e.preventDefault();
  };

  /**
   * signup fetch
   * 
   * @param username : string
   * @param password : string
   */
  const signup = (username: string, password: string) => {
    
    fetch('/signup', { 
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
        // redirect to main page on successful signup (user will be loggedin because server sets refresh token cookie)
        window.location.href = '/';
        
      } else {
        // TODO: form handling (bad signup)
        console.log(result);
      }
    })
    .catch(error => {
      // TODO: form handling (signup error)
      console.error('Error:', error);
    });

  }

  
  return (
    <Container>
      <h2>Register</h2>
      <hr />
      <Box m={2}>
        <form onSubmit={submitSignUp}>
          <Box pt={2} >
            <TextField required value={username} name="username" onChange={handleFormFieldChange} variant="outlined" label="username" type="text"  />
          </Box>
          <Box pt={2}>
            <TextField required value={password} name="password" onChange={handleFormFieldChange} variant="outlined" label="password" type="password" />
          </Box>
          <Box pt={2}>
            <TextField required value={repeatPassword} name="repeatpassword" onChange={handleFormFieldChange} variant="outlined" label="retype password" type="password" />
          </Box>
          <Box pt={2}>
            <Button type='submit' size="large" variant="contained" color="primary">Register</Button>
          </Box>
        </form>
        <Box mt={2}><small>Click <a href='/login'>here</a> to login</small></Box>
      </Box>
    </Container>
  );

}

export default connect()(RegisterForm);

