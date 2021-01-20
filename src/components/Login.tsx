import { Component } from 'react';
import { Container, Box, TextField, Button, AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Chat from './Chat';
import { LoginProps, LoginState, User } from '../App.config';


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
      user: {username: '', peerID: ''},
      token: false
    };

    this.handleFormFieldChange = this.handleFormFieldChange.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.submitLogout = this.submitLogout.bind(this);

  }

  componentDidMount() {

    this.setState({ isLoading: true });
    /**
    * Refresh token
    */
    fetch('/refreshtoken', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.json())
    .then((result) => {
      if (typeof result.username !== 'undefined') {
        this.setState({ 
          isLoggedIn: true, 
          isLoading: false, 
          user: { username: result.username, peerID: ''}, 
          token: result.token
        });
      } else {
        this.setState({ isLoggedIn: false, isLoading: false });
      }
    }, (error) => {
      // check if offline mode enabled
      console.log(error);
      this.setState({ isLoggedIn: false, isLoading: false });
    });
      
    
  }


  login(username: string, password: string) {
    this.setState({ isLoading: true });
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
        this.setState({ isLoggedIn: true, isLoading: false, user: user, token: result.token });
      } else this.setState({ isLoggedIn: false, isLoading: false});
      console.log(result);
    })
    .catch(error => {
      this.setState({ isLoggedIn: false, isLoading: false});
      console.error('Error:', error);
    });
  }


  submitLogin(e: React.SyntheticEvent) {
    this.login(this.state.username, this.state.password);
    e.preventDefault();
  };


  submitLogout(e: React.MouseEvent) {
    this.logout();
  }


  logout() {
    fetch('/logout', { method: 'POST', headers: {'Content-Type': 'application/json'}})
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.error(err);
    }).finally(() => {
      this.setState({ 
        isLoading: false, 
        isLoggedIn: false, 
        user: {username: '', peerID: ''}, 
        token: false
      });
    });
    
  }

  handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'username') this.setState({ username: event.target.value });
    else if (event.target.name === 'password') this.setState({ password: event.target.value });
  }


  render() {
    const { username, password, isLoading, isLoggedIn, user, token } = this.state;
    
    if (isLoading) return(<></>);
    
    else if (isLoggedIn) {

      return (
      <>
      <Box className='app'>
        <Box className='header'>
          <AppBar position="static" elevation={0}>
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6">p2pChat</Typography>
              <Button color="inherit" onClick={this.submitLogout} >Logout</Button>
            </Toolbar>
          </AppBar>
        </Box>
        <Box className='wrapper'>
          <Chat user={user} token={token} />
        </Box>
      </Box>
      </>
      );
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
