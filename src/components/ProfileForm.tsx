import React, { useState, useEffect } from 'react'
import { UpdateSystemUser, UpdateUserProfiles } from '../actions';
import { User, UserProfile } from '../App.config'
import { connect } from 'react-redux';
import { exists } from '../App.fn'
import { Avatar, Box, TextField, Button, Typography, IconButton, FormControlLabel, FormLabel, FormHelperText } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Dexie from 'dexie'

type ProfileFormProps = {
  user: User,
  profile: UserProfile,
  db: Dexie,
  dispatch: any
}

const ProfileForm: React.FC<ProfileFormProps> = (props: ProfileFormProps) => {
  
  const [ firstname, setFirstName ] = useState<string>(typeof props.profile.firstname === 'string' ? props.profile.firstname : '');
  const [ lastname, setLastName ] = useState<string>(typeof props.profile.lastname === 'string' ? props.profile.lastname : '');
  const [ headline, setHeadline ] = useState<string>(typeof props.profile.headline === 'string' ? props.profile.headline : '');
  const [ bio, setBio ] = useState<string>(typeof props.profile.bio === 'string' ? props.profile.bio : '');
  const [ image, setImage ] = useState<string>(typeof props.profile.profilepic === 'string' ? props.profile.profilepic : '');

  const imageInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  const submitProfileForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    let user_profile = {username: props.user.username, firstname: firstname, lastname: lastname, headline: headline, bio: bio, profilepic: image}
    props.db.table('user_profiles').put(user_profile)
    .then((id) => { console.log(`Updated user profile for ${user_profile.username} in IndexedDB`) })
    .catch((err) => { console.log(`Could not store user profile ${err}`); })
    .finally(() => { props.dispatch(UpdateUserProfiles(user_profile)); });
  };

  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'first') setFirstName(event.target.value);
    else if (event.target.name === 'last') setLastName(event.target.value);
    else if (event.target.name === 'headline') setHeadline(event.target.value);
    else if (event.target.name === 'bio') setBio(event.target.value);
  }

  const handleProfilePic = (event: any) => {
    
    const reader = new FileReader();
    const name = event.target.name;
    const file = event.target.files[0];

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
          <FormHelperText>Click Account Circle icon to select an image</FormHelperText>
          {image.length ? <Avatar><img src={image} style={{width: '100%'}}></img></Avatar> : <></>}
        </Box>
        <Box pt={2} pb={2}>
          <Button type='submit' size="small" variant="contained" color="primary">Save</Button>
        </Box>
      </form>
    </Box>
  );

}

export default connect()(ProfileForm);

