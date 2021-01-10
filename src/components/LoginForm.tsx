import { Component } from 'react'
import { Container, Box, TextField, Button } from '@material-ui/core';


type LoginFormProps = {
 
}

type LoginFormState = {
  username: string,
  password: string
}

/************************************************************************
 * 
 */
class LoginForm extends Component<LoginFormProps, LoginFormState> {


  constructor(props: LoginFormProps | Readonly<LoginFormProps>) {

    super(props);

    this.state = {
      username: '',
      password: ''
    };

    this.handleFormFieldChange = this.handleFormFieldChange.bind(this);
    this.login = this.login.bind(this);

  }

  componentDidMount() {
    /**
     * Check if logged in
     */
    fetch("/check")
    .then(res => res.json())
    .then((result) => {
      if (typeof result.username !== 'undefined') window.location.href = "/chat";
    }, (error) => {
      console.log(error);
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
      if (typeof result.success !== 'undefined') window.location.href = "/chat";
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

    const { username, password } = this.state;

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



export default LoginForm;