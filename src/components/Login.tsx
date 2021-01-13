import { Component } from 'react';
import { Container, Box, TextField, Button } from '@material-ui/core';
import Peer from 'peerjs';
import Chat from './Chat';
import { User } from '../Interfaces';

type LoginProps = {

}

type LoginState = {
  username: string,
  password: string,
  isLoading: Boolean,
  isLoggedIn: Boolean,
  user: User
}

/************************************************************************
 * 
 */
class Login extends Component<LoginProps, LoginState> {

  constructor(props: LoginProps | Readonly<LoginProps>) {
    
    super(props);

    this.state = {
      username: '',
      password: '',
      isLoading: false,
      isLoggedIn: false,
      user: {username: '', peerID: '', _id: ''}
    };

    this.handleFormFieldChange = this.handleFormFieldChange.bind(this);
    this.login = this.login.bind(this);

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
      } else this.setState({ isLoading: false });
    }, (error) => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }

  componentWillUnmount() {
  
  }

  login(e: React.SyntheticEvent) {
    e.preventDefault();
    fetch('/login', { 
      method: 'POST', 
      body: JSON.stringify({ 
        username: this.state.username, 
        password: this.state.password 
      }), 
      headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      if (typeof result.success !== 'undefined') {
        let user: User = this.state.user;
        user.username = this.state.username;
        this.setState({ isLoggedIn: true, isLoading: false, user: user });
      }
      console.log(result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  handleFormFieldChange = (event: React.ChangeEvent) => {
    if ((event.target as HTMLInputElement).name === 'username')
      this.setState({ username: (event.target as HTMLInputElement).value });
    else if ((event.target as HTMLInputElement).name === 'password')
      this.setState({ password: (event.target as HTMLInputElement).value });
    
  }




  render() {

    const { username, password, isLoading, isLoggedIn, user } = this.state;
    
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
            <form onSubmit={(e: React.SyntheticEvent) => { this.login(e) }}>
              <Box pt={2} >
                <TextField required value={username} name="username" onChange={this.handleFormFieldChange} variant="outlined" label="username" type="text"  />
              </Box>
              <Box pt={2}>
                <TextField required value={password} name="password" onChange={this.handleFormFieldChange} variant="outlined" label="password" type="password" />
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