import { DataConnection } from 'peerjs' // used for ChatState type
import { User, Messages, Connections } from './App.config'


export interface SystemState {
  isLoggedIn: boolean,
  token: string|false
  offline: boolean
}

export interface ChatState {
  online: {[key: string]: User},
  connections: Connections,
  messages: Messages
}

export const UPDATE_CONNECTIONS = 'UPDATE_CONNECTIONS'
export const UPDATE_ONLINE = 'UPDATE_ONLINE'


interface AddConnectionAction {
  type: typeof UPDATE_CONNECTIONS
  key: string,
  connection: any
}

interface UpdateOnlineAction {
  type: typeof UPDATE_ONLINE
  payload: {[key: string]: User}
}

export type ActionTypes = AddConnectionAction | UpdateOnlineAction





