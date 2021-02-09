import React, { useState } from 'react'
import { connect } from 'react-redux';
import { Container, Box, TextField, Button } from '@material-ui/core';


const RegisterForm: React.FC = (props: any) => {
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');

  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'username') setUsername(event.target.value);
    else if (event.target.name === 'password') setPassword(event.target.value);
    else if (event.target.name === 'repeatpassword') setRepeatPassword(event.target.value);
  }
  
  const submitLogin = (e: React.SyntheticEvent) => {
    if (password !== repeatPassword) console.log('dont submit');
    signup(username, password);
    e.preventDefault();
  };

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
        window.location.href = '/';
        
      } else {
        //TODO
        // form handling (bad login)
        console.log(result);
      }
    })
    .catch(error => {
      //TODO
      // form handling (bad login)
      console.error('Error:', error);
    });

  }

  
  return (
    <Container>
      <h2>Register</h2>
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

