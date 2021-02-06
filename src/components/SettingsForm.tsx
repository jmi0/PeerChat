import React, { useState, useEffect } from 'react'
import { UpdateSystemUser } from '../actions';
import { connect } from 'react-redux';
import { Container, Box, TextField, Button, Typography, FormControl, FormLabel, FormGroup, FormControlLabel, Switch } from '@material-ui/core';


const SettingsForm: React.FC = (props: any) => {
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'username') setUsername(event.target.value);
    else if (event.target.name === 'password') setPassword(event.target.value);
  }

  return (
    <Box>
      <Typography variant="h6">Settings</Typography>
      <hr />
      <FormControl component="fieldset">
        <FormGroup>
          <FormControlLabel
            control={<Switch name="removedata" />}
            label="Remove all conversations from database on logout"
          />
          <FormControlLabel
            control={<Switch name="offlinemode" />}
            label="Allow access to account offline"
          />
        </FormGroup>
      </FormControl> 
    </Box>
  );

}

export default connect()(SettingsForm);

