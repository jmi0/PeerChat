import { User, UserProfile, UserProfiles, UserSettings, Connections, Message, ADD_CONNECTION, UPDATE_ONLINE, ActionTypes, UPDATE_MESSAGES, UPDATE_LOGIN_STATE, UPDATE_TOKEN, UPDATE_OFFLINE_STATE, UPDATE_SYSTEM_USER, UPDATE_SELECTED_USER, UPDATE_BULK_MESSAGES, USER_LOGOUT, UPDATE_CONNECTIONS, UPDATE_BULK_CONNECTIONS, UPDATE_MESSAGE_SEEN, UPDATE_USER_PROFILES, UPDATE_BULK_USER_PROFILES, UPDATE_USER_SETTINGS } from './App.config'
import Peer, { DataConnection } from 'peerjs'


export function addConnection(key: string, connection: any): ActionTypes {
  return {
    type: ADD_CONNECTION,
    key: key,
    connection: connection
  }
}

export function updateOnline(newOnline: {[key: string]: User}): ActionTypes {
  return {
    type: UPDATE_ONLINE,
    payload: newOnline
  }
}

export function updateMessages(key: string, message: Message): ActionTypes {
  return {
    type: UPDATE_MESSAGES,
    key: key,
    message: message
  }
}

export function updateLoginState(isLoggedIn: boolean): ActionTypes {
  return {
    type: UPDATE_LOGIN_STATE,
    isLoggedIn: isLoggedIn
  }
}

export function updateToken(token: string): ActionTypes {
  return {
    type: UPDATE_TOKEN,
    token: token
  }
}

export function updateOfflineState(offline: boolean): ActionTypes {
  return {
    type: UPDATE_OFFLINE_STATE,
    offline: offline
  }
}


export function UpdateSystemUser(user: User|false, isLoggedIn: boolean, offline: boolean, token: string|false): ActionTypes {
  return {
    type: UPDATE_SYSTEM_USER,
    user: user,
    isLoggedIn: isLoggedIn,
    offline: offline,
    token: token
  }
}

export function UpdateSelectedUser(user: User): ActionTypes {
  return {
    type: UPDATE_SELECTED_USER,
    user: user
  }
}


export function UpdateBulkMessages(key: string, messages: Message[]): ActionTypes {
  return {
    type: UPDATE_BULK_MESSAGES,
    key: key,
    messages: messages
  }
}

export function UserLogout(): ActionTypes {
  return {
    type: USER_LOGOUT
  }
}

export function UpdateConnections(user: User): ActionTypes {
  return {
    type: UPDATE_CONNECTIONS,
    connection: user
  }
}

export function UpdateBulkConnections(connections: Connections): ActionTypes {
  return {
    type: UPDATE_BULK_CONNECTIONS,
    connections: connections
  }
}

export function UpdateMessageSeen(key: string, timestamp: string): ActionTypes {
  return {
    type: UPDATE_MESSAGE_SEEN,
    key: key,
    timestamp: timestamp
  }
}

export function UpdateUserProfiles(user_profile: UserProfile): ActionTypes {
  return {
    type: UPDATE_USER_PROFILES,
    user_profile: user_profile
  }
}

export function UpdateBulkUserProfiles(user_profiles: UserProfiles): ActionTypes {
  return {
    type: UPDATE_BULK_USER_PROFILES,
    user_profiles: user_profiles
  }
}

export function UpdateUserSettings(user_settings: UserSettings): ActionTypes {
  return {
    type: UPDATE_USER_SETTINGS,
    user_settings: user_settings
  }
}



