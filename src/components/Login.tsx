import { Component } from 'react';
import { Container, Box, TextField, Button, FormControlLabel, Checkbox } from '@material-ui/core';
import CryptoJS from 'crypto-js';
import Peer from 'peerjs';
import Chat from './Chat';
import CLIENT_KEY, { LoginProps, LoginState, User } from '../App.config';



/************************************************************************
 * 
 */
class Login extends Component<LoginProps, LoginState> {

  constructor(props: LoginProps | Readonly<LoginProps>) {
    
    super(props);

    this.state = {
      username: '',
      password: '',
      keepMeLoggedIn: false,
      isLoading: false,
      isLoggedIn: false,
      user: {username: '', peerID: '', _id: ''}
    };

    this.handleFormFieldChange = this.handleFormFieldChange.bind(this);
    this.login = this.login.bind(this);
    this.submitLogin = this.submitLogin.bind(this);

  }

  componentDidMount() {
    this.setState({ isLoading: true });
    /**
     * Check if logged in
     */
    fetch("/check")
    .then(res => res.json())
    .then((result) => {
      if (typeof result.username !== 'undefined') {
        let user: User = this.state.user;
        user.username = result.username;
        this.setState({ isLoggedIn: true, isLoading: false, user: user});
      } else {
        this.setState({ isLoading: false });
      }
    }, (error) => {
      console.log(error);

      this.setState({ isLoading: false });
    })
  }

  componentWillUnmount() {
  
  }

  keepMeLoggedIn() {
    
    let lastUser: string|null = localStorage.getItem(CryptoJS.SHA256(`lastUser`).toString(CryptoJS.enc.Base64));
    if (lastUser !== null) {
      /*
      var user = JSON.parse(CryptoJS.AES.decrypt(lastUser, `${this.CLIENT_KEY}lastUser`).toString(CryptoJS.enc.Utf8));
        this.setState({ 
          username: user.username, 
          localPeerID: user.peerID, 
          localPeer: new Peer(user.peerID, {
          host: window.location.hostname, port: 9000, path: '/peerserver'
        })
      });
      */
    }
      
  }

  login(username: string, password: string, keepMeLoggedin: true|false) {
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
        let user: User = this.state.user;
        user.username = this.state.username;
        this.setState({ isLoggedIn: true, isLoading: false, user: user });
        if (this.state.keepMeLoggedIn) {
          localStorage.setItem(
            CryptoJS.SHA256(`lastPersistentUser`).toString(CryptoJS.enc.Base64), 
            CryptoJS.AES.encrypt(JSON.stringify({username: result.username, password: this.state.password}), `lastPersistentUser${CLIENT_KEY}`).toString()
          );
        }
        
      }
      console.log(result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  submitLogin(e: React.SyntheticEvent) {
    this.login(this.state.username, this.state.password, this.state.keepMeLoggedIn);
    e.preventDefault();
  };

  handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'username') this.setState({ username: event.target.value });
    else if (event.target.name === 'password') this.setState({ password: event.target.value });
    else if (event.target.name === 'keepMeLoggedIn') this.setState({ keepMeLoggedIn: event.target.checked });
  }




  render() {

    const { username, password, keepMeLoggedIn, isLoading, isLoggedIn, user } = this.state;
    
    if (isLoading) return(<></>);
    
    else if (isLoggedIn) {
      const localPeer = new Peer({
        host: window.location.hostname,
        port: 9000, 
        path: '/peerserver'
      });
      return (<><Chat localPeer={localPeer} user={user} /></>);
    }
    
    else {
      return (
        <Container>
          <Box m={2}>
            <form onSubmit={(e: React.SyntheticEvent) => { this.submitLogin(e) }}>
              <Box pt={2} >
                <TextField required value={username} name="username" onChange={this.handleFormFieldChange} variant="outlined" label="username" type="text"  />
              </Box>
              <Box pt={2}>
                <TextField required value={password} name="password" onChange={this.handleFormFieldChange} variant="outlined" label="password" type="password" />
              </Box>
              <Box pt={1} pl={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={keepMeLoggedIn}
                      onChange={this.handleFormFieldChange}
                      name="keepMeLoggedIn"
                      color="secondary"
                    />
                  }
                  label="Keep me logged in"
                />
              </Box>
              <Box pt={2}> 
                <Button type='submit' size="large" variant="contained" color="primary">Login</Button>
              </Box>
            </form>
          </Box>
        </Container>
      );
    }
  }
  
}



export default Login;