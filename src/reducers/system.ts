import { 
  SystemState, 
  ActionTypes, 
  UPDATE_TOKEN, 
  UPDATE_LOGIN_STATE, 
  UPDATE_OFFLINE_STATE, 
  UPDATE_SYSTEM_USER
} from '../App.config'


const initialState: SystemState = {
  user: false,
  isLoggedIn: false,
  token: false,
  offline: false
}

export function system (
  state = initialState,
  action: ActionTypes
): SystemState {
  console.log(action.type);
  switch (action.type) {

    case UPDATE_LOGIN_STATE:
      return {...state, isLoggedIn: action.isLoggedIn }
    
    case UPDATE_TOKEN:
      return {...state, token: action.token}

    case UPDATE_OFFLINE_STATE:
      return {...state, offline: action.offline}

    case UPDATE_SYSTEM_USER:
      return {...state, user: action.user}
    
    default:
      
      return state
  
  }
}