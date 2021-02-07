import React, { useState, useEffect } from 'react'
import { UpdateSystemUser } from '../actions';
import { connect } from 'react-redux';
import { Container, Box, TextField, Button, Typography, FormControl, FormLabel, FormGroup, FormControlLabel, Switch } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { findAllByDisplayValue } from '@testing-library/react';

const useStyles = makeStyles({
  switchLabel: {
    paddingTop: '20px'
  }
});

const SettingsForm: React.FC = (props: any) => {
  
  const classes = useStyles();
  const [deleteMessages, setDeleteMessages] = useState<boolean>(false);
  const [allowOffline, setAllowOffline] = useState<boolean>(false);

  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'removedata') setDeleteMessages(event.target.checked);
    else if (event.target.name === 'offlinemode') setAllowOffline(event.target.checked);
  }

  return (
    <Box>
      <Typography variant="h6">Settings</Typography>
      <hr />
      <FormControl component="fieldset">
        <FormGroup>
          <FormControlLabel
            className={classes.switchLabel}
            control={<Switch onChange={handleFormFieldChange} checked={deleteMessages} name="removedata" />}
            label="Remove all conversations from database on logout"
            
          />
          <FormControlLabel
            className={classes.switchLabel}
            control={<Switch onChange={handleFormFieldChange} checked={allowOffline} name="offlinemode" />}
            label="Allow access to account offline"
          />
        </FormGroup>
      </FormControl> 
    </Box>
  );

}

export default connect()(SettingsForm);

