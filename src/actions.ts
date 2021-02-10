/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 09:58:16 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:43:29
 */

import { 
  User, 
  UserProfile, 
  UserProfiles, 
  UserSettings, 
  Connections, 
  Message, 
  ADD_CONNECTION, 
  UPDATE_ONLINE,
  UPDATE_MESSAGES, 
  UPDATE_LOGIN_STATE, 
  UPDATE_TOKEN, 
  UPDATE_OFFLINE_STATE, 
  UPDATE_SYSTEM_USER, 
  UPDATE_SELECTED_USER, 
  UPDATE_BULK_MESSAGES, 
  USER_LOGOUT, 
  UPDATE_CONNECTIONS, 
  UPDATE_BULK_CONNECTIONS, 
  UPDATE_MESSAGE_SEEN, 
  UPDATE_USER_PROFILES, 
  UPDATE_BULK_USER_PROFILES, 
  UPDATE_USER_SETTINGS,
  ActionTypes
} from './App.config'


/**
 * 
 * @param key 
 * @param connection 
 */
export function addConnection(key: string, connection: any): ActionTypes {
  return {
    type: ADD_CONNECTION,
    key: key,
    connection: connection
  }
}

/**
 * 
 * @param newOnline 
 */
export function updateOnline(newOnline: {[key: string]: User}): ActionTypes {
  return {
    type: UPDATE_ONLINE,
    payload: newOnline
  }
}

/**
 * 
 * @param key 
 * @param message 
 */
export function updateMessages(key: string, message: Message): ActionTypes {
  return {
    type: UPDATE_MESSAGES,
    key: key,
    message: message
  }
}

/**
 * 
 * @param isLoggedIn 
 */
export function updateLoginState(isLoggedIn: boolean): ActionTypes {
  return {
    type: UPDATE_LOGIN_STATE,
    isLoggedIn: isLoggedIn
  }
}

/**
 * 
 * @param token 
 */
export function updateToken(token: string): ActionTypes {
  return {
    type: UPDATE_TOKEN,
    token: token
  }
}


/**
 * 
 * @param offline 
 */
export function updateOfflineState(offline: boolean): ActionTypes {
  return {
    type: UPDATE_OFFLINE_STATE,
    offline: offline
  }
}

/**
 * 
 * @param user 
 * @param isLoggedIn 
 * @param offline 
 * @param token 
 */
export function UpdateSystemUser(user: User|false, isLoggedIn: boolean, offline: boolean, token: string|false): ActionTypes {
  return {
    type: UPDATE_SYSTEM_USER,
    user: user,
    isLoggedIn: isLoggedIn,
    offline: offline,
    token: token
  }
}

/**
 * 
 * @param user 
 */
export function UpdateSelectedUser(user: User): ActionTypes {
  return {
    type: UPDATE_SELECTED_USER,
    user: user
  }
}

/**
 * 
 * @param key 
 * @param messages 
 */
export function UpdateBulkMessages(key: string, messages: Message[]): ActionTypes {
  return {
    type: UPDATE_BULK_MESSAGES,
    key: key,
    messages: messages
  }
}

/**
 * will reset to initial states in reducer
 */
export function UserLogout(): ActionTypes {
  return {
    type: USER_LOGOUT
  }
}

/**
 * 
 * @param user 
 */
export function UpdateConnections(user: User): ActionTypes {
  return {
    type: UPDATE_CONNECTIONS,
    connection: user
  }
}

/**
 * 
 * @param connections 
 */
export function UpdateBulkConnections(connections: Connections): ActionTypes {
  return {
    type: UPDATE_BULK_CONNECTIONS,
    connections: connections
  }
}

/**
 * 
 * @param key 
 * @param timestamp 
 */
export function UpdateMessageSeen(key: string, timestamp: string): ActionTypes {
  return {
    type: UPDATE_MESSAGE_SEEN,
    key: key,
    timestamp: timestamp
  }
}

/**
 * 
 * @param user_profile 
 */
export function UpdateUserProfiles(user_profile: UserProfile): ActionTypes {
  return {
    type: UPDATE_USER_PROFILES,
    user_profile: user_profile
  }
}

/**
 * 
 * @param user_profiles 
 */
export function UpdateBulkUserProfiles(user_profiles: UserProfiles): ActionTypes {
  return {
    type: UPDATE_BULK_USER_PROFILES,
    user_profiles: user_profiles
  }
}

/**
 * 
 * @param user_settings 
 */
export function UpdateUserSettings(user_settings: UserSettings): ActionTypes {
  return {
    type: UPDATE_USER_SETTINGS,
    user_settings: user_settings
  }
}



