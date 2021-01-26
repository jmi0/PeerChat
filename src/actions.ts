import { User, Message, ADD_CONNECTION, UPDATE_ONLINE, ActionTypes, UPDATE_MESSAGES, UPDATE_LOGIN_STATE, UPDATE_TOKEN, UPDATE_OFFLINE_STATE, UPDATE_SYSTEM_USER } from './App.config'
import { DataConnection } from 'peerjs'


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


export function UpdateSystemUser(user: User|false): ActionTypes {
  return {
    type: UPDATE_SYSTEM_USER,
    user: user
  }
}

