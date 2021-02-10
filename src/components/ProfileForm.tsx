/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 11:20:53 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:26:15
 */

import React, { useState } from 'react'
import { connect } from 'react-redux';

import { exists } from '../App.fn'
import { UpdateUserProfiles } from '../actions';
import { ProfileFormProps, UserProfile } from '../App.config'

import { Avatar, Box, TextField, Button, Typography, IconButton, FormControlLabel, FormHelperText } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';


/**
 * Form to create/edit/save/dispatch user profile data
 * 
 * @param props : ProfileFormProps
 */
const ProfileForm: React.FC<ProfileFormProps> = (props: ProfileFormProps) => {

  const [ firstname, setFirstName ] = useState<string>(typeof props.profile.firstname === 'string' ? props.profile.firstname : '');
  const [ lastname, setLastName ] = useState<string>(typeof props.profile.lastname === 'string' ? props.profile.lastname : '');
  const [ headline, setHeadline ] = useState<string>(typeof props.profile.headline === 'string' ? props.profile.headline : '');
  const [ bio, setBio ] = useState<string>(typeof props.profile.bio === 'string' ? props.profile.bio : '');
  const [ image, setImage ] = useState<string>(typeof props.profile.profilepic === 'string' ? props.profile.profilepic : '');
  const [ formSubmitted, setFormSubmitted ] = useState<boolean>(false);
  const [ submissionError, setSubmissionError ] = useState<string|false>(false);
  
  const imageInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  /**
   * submit profile changes
   * 
   * @param e : React.SyntheticEvent
   */
  const submitProfileForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // create valid user profile from state
    let user_profile: UserProfile = {username: props.user.username, firstname: firstname, lastname: lastname, headline: headline, bio: bio, profilepic: image}
    // put user profile in db
    props.db.table('user_profiles').put(user_profile)
    .then((id) => { console.log(`Updated user profile for ${user_profile.username} in IndexedDB`) })
    .catch((err) => { 
      setSubmissionError(`Something went wrong. ${err.message}`);
      console.log(`Could not store user profile ${err}`); 
    })
    .finally(() => {
      // form submission state and dispatch change
      setFormSubmitted(true);
      props.dispatch(UpdateUserProfiles(user_profile));
    });
  };

  /**
   * handle text input changes
   * 
   * @param event : React.ChangeEvent<HTMLInputElement>
   */
  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormSubmitted(false);
    if (event.target.name === 'first') setFirstName(event.target.value);
    else if (event.target.name === 'last') setLastName(event.target.value);
    else if (event.target.name === 'headline') setHeadline(event.target.value);
    else if (event.target.name === 'bio') setBio(event.target.value);
  }

  /**
   * Handle profile picture file change
   * 
   * @param event : any
   */
  const handleProfilePic = (event: any) => {
    
    const reader = new FileReader();
    const file = event.target.files[0];

    // don't allow file larger than 400000 bytes
    if (exists(file.size) && file.size > 400000) return;
    
    reader.onloadend = () => {
      if (typeof reader.result === 'string') 
        setImage(reader.result);
    }
    reader.readAsDataURL(file);
    
  };
  
  
  return (
    <Box>
      <Typography variant="h6">Profile</Typography>
      <FormHelperText>This information is saved locally and will be shared with peers only once you have connected.</FormHelperText>
      {formSubmitted ? 
        <Box pb={1} pt={1}>
          {submissionError ? 
          <Alert severity="error">{submissionError}</Alert> : 
          <Alert severity="success">Profile Updated</Alert>
          }
        </Box> : 
        <></>
      }
      <form onSubmit={submitProfileForm}>
        <Box pt={2} >
          <TextField value={firstname} name="first" label="First Name" type="text" onChange={handleFormFieldChange} />
        </Box>
        <Box pt={1}>
          <TextField value={lastname} name="last" label="Last Name" type="text" onChange={handleFormFieldChange} />
        </Box>
        <Box pt={1}>
          <TextField value={headline} name="headline" label="Headline" type="text" onChange={handleFormFieldChange} />
        </Box>
        <Box pt={1}>
          <TextField
            name='bio'
            label="Bio"
            value={bio}
            multiline
            rows={3}
            placeholder="Write something about yourself..."
            onChange={handleFormFieldChange}
          />
        </Box>
        <Box pt={3} pb={3}>
          <FormControlLabel
            label='Profile Pic'
            control={<IconButton onClick={() => {imageInputRef.current?.click();}}><AccountCircleIcon /><input name='image' ref={imageInputRef} style={{display:'none'}} type={"file"} accept={'.jpg,.jpeg,.png,.gif'} onChange={handleProfilePic} /></IconButton>}
          />
          <FormHelperText>Click icon above to update avatar image</FormHelperText>
          {image.length ? <Avatar><img alt={`avatar`} src={image} style={{width: '100%'}}></img></Avatar> : <></>}
        </Box>
        <Box pt={2} pb={2}>
          <Button type='submit' size="small" variant="contained" color="primary">Save</Button>
        </Box>
      </form>
    </Box>
  );

}

export default connect()(ProfileForm);

