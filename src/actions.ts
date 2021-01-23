import { UPDATE_CONNECTIONS, UPDATE_ONLINE, ActionTypes } from './actionTypes'
import { User, Connections, Messages, Message } from './App.config'
import { DataConnection } from 'peerjs'

// TypeScript infers that this function is returning AddConnectionAction
export function addConnection(key: string, connection: any): ActionTypes {
  return {
    type: UPDATE_CONNECTIONS,
    key: key,
    connection: connection
  }
}

// TypeScript infers that this function is returning UpdateOnlineAction
export function updateOnline(newOnline: {[key: string]: User}): ActionTypes {
  return {
    type: UPDATE_ONLINE,
    payload: newOnline
  }
}