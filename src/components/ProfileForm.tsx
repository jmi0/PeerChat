import React, { useState, useEffect } from 'react'
import { UpdateSystemUser } from '../actions';
import { connect } from 'react-redux';
import { Container, Box, TextField, Button, Typography, IconButton, FormControlLabel, FormLabel } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';


const ProfileForm: React.FC = (props: any) => {
  
  const [ firstname, setFirstName ] = useState<string>('');
  const [ lastname, setLastName ] = useState<string>('');
  const [ headline, setHeadline ] = useState<string>('');
  const [ bio, setBio ] = useState<string>('');
  const [ image, setImage ] = useState<string>('');

  const imageInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  const handleFormFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'first') setFirstName(event.target.value);
    else if (event.target.name === 'last') setLastName(event.target.value);
    else if (event.target.name === 'headline') setHeadline(event.target.value);
    else if (event.target.name === 'bio') setBio(event.target.value);
  }

  return (
    <Box>
      <Typography variant="h6">Profile</Typography>
      <Typography>This information is saved locally and will be shared with peers only once you have connected.</Typography>
      <form>
        <Box pt={1} >
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
            label="Bio"
            defaultValue={bio}
            multiline
            rows={3}
            placeholder="Write something about yourself..."
            onChange={handleFormFieldChange}
          />
        </Box>
        <Box pt={3} pb={3}>
          <FormControlLabel
            label='Profile Pic'
            control={<IconButton onClick={() => {imageInputRef.current?.click();}}><AccountCircleIcon /><input name='image' ref={imageInputRef} style={{display:'none'}} type={"file"} accept={'.jpg,.jpeg,.png,.gif'} /></IconButton>}
          />
        </Box>
        <Box pt={2} pb={2}>
          <Button type='submit' size="small" variant="contained" color="primary">Save</Button>
        </Box>
      </form>
    </Box>
  );

}

export default connect()(ProfileForm);

