import React, { useState, useEffect } from 'react'
import { UpdateSystemUser, UpdateUserSettings } from '../actions';
import { connect } from 'react-redux';
import { Container, Box, TextField, Button, Typography, FormControl, FormLabel, FormGroup, FormControlLabel, Switch } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { UserSettings, User } from '../App.config';
import Dexie from 'dexie';

const useStyles = makeStyles({
  switchLabel: {
    paddingTop: '20px'
  }
});

type SettingsFormProps = {
  user: User,
  userSettings: UserSettings|false,
  db: Dexie,
  dispatch: any
}

const SettingsForm: React.FC<SettingsFormProps> = (props: SettingsFormProps) => {
  
  const classes = useStyles();
  const [deleteMessages, setDeleteMessages] = useState<boolean>(props.userSettings ? props.userSettings.deleteMessagesOnLogout : false);
  const [allowOffline, setAllowOffline] = useState<boolean>(props.userSettings ? props.userSettings.allowOffline : false);

  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'removedata') {
      setDeleteMessages(event.target.checked);
      props.db.table('user_settings').put({username: props.user.username, deleteMessagesOnLogout: event.target.checked, allowOffline: allowOffline})
      .then((id) => {
        props.dispatch(UpdateUserSettings({username: props.user.username, deleteMessagesOnLogout: event.target.checked, allowOffline: allowOffline}));
      })
      .catch((err) => { console.log(`Could not update settings ${err.message}`); });
    }
    else if (event.target.name === 'offlinemode') {
      setAllowOffline(event.target.checked);
      props.db.table('user_settings').put({username: props.user.username, deleteMessagesOnLogout: deleteMessages, allowOffline: event.target.checked})
      .then((id) => {
        props.dispatch(UpdateUserSettings({username: props.user.username, deleteMessagesOnLogout: deleteMessages, allowOffline: event.target.checked}));
      })
      .catch((err) => { console.log(`Could not update settings ${err.message}`); });
    }
    
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

