/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 11:35:16 
 * @Last Modified by:   joe.iannone 
 * @Last Modified time: 2021-02-10 11:35:16 
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';

import { UpdateUserSettings } from '../actions';
import { SettingsFormProps } from '../App.config';

import { Box, Typography, FormControl, FormGroup, FormControlLabel, Switch } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";


// switch label style
// TODO: move all materialUI makeStyles to separate file
const useStyles = makeStyles({
  switchLabel: { paddingTop: '20px' }
});


/**
 * Form to update/save/dispatch various user settings
 * 
 * @param props : SettingsFormProps
 */
const SettingsForm: React.FC<SettingsFormProps> = (props: SettingsFormProps) => {
  
  const classes = useStyles();
  const [deleteMessages, setDeleteMessages] = useState<boolean>(props.userSettings ? props.userSettings.deleteMessagesOnLogout : false);
  const [allowOffline, setAllowOffline] = useState<boolean>(props.userSettings ? props.userSettings.allowOffline : false);

  /**
   * handle form switches
   * 
   * @param event : React.ChangeEvent<HTMLInputElement>
   */
  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // on remove conversation data after logout switch
    if (event.target.name === 'removedata') {
      // update local state and db
      setDeleteMessages(event.target.checked);
      props.db.table('user_settings').put({username: props.user.username, deleteMessagesOnLogout: event.target.checked, allowOffline: allowOffline})
      .then((id) => {
        // dispatch change
        props.dispatch(UpdateUserSettings({username: props.user.username, deleteMessagesOnLogout: event.target.checked, allowOffline: allowOffline}));
      })
      .catch((err) => { console.log(`Could not update settings ${err.message}`); });
    }
    // offline mode switch
    else if (event.target.name === 'offlinemode') {
      // update local state and db
      setAllowOffline(event.target.checked);
      props.db.table('user_settings').put({username: props.user.username, deleteMessagesOnLogout: deleteMessages, allowOffline: event.target.checked})
      .then((id) => {
        // dispatch change
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

