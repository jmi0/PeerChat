/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 09:59:21 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:41:45
 */

import { 
  SystemState, 
  ActionTypes, 
  UPDATE_TOKEN, 
  UPDATE_LOGIN_STATE, 
  UPDATE_OFFLINE_STATE, 
  UPDATE_SYSTEM_USER,
  USER_LOGOUT,
  UPDATE_USER_SETTINGS
} from '../App.config'


const initialState: SystemState = {
  user: false,
  isLoggedIn: false,
  token: false,
  offline: false,
  userSettings: false
}

/**
 * System state reducer
 * 
 * @param state 
 * @param action 
 */
export function system (
  state = initialState,
  action: ActionTypes
): SystemState {
  
  switch (action.type) {

    case UPDATE_LOGIN_STATE:
      return {...state, isLoggedIn: action.isLoggedIn }
    
    case UPDATE_TOKEN:
      return {...state, token: action.token}

    case UPDATE_OFFLINE_STATE:
      return {...state, offline: action.offline}

    case UPDATE_SYSTEM_USER:
      return {...state, user: action.user, isLoggedIn: action.isLoggedIn, offline: action.offline, token: action.token }
    
    case UPDATE_USER_SETTINGS:
      return {...state, userSettings: action.user_settings }
    
    case USER_LOGOUT:
      return initialState;
    
    default:
      
      return state
  
  }
}