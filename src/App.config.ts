import Peer, { DataConnection } from 'peerjs' // used for ChatState type


const APP_CONFIG = {
    CLIENT_KEY: 'AfxKcLYZTn9SWcDZL',
};
export default APP_CONFIG;


export interface Connections {
    [key: string]: DataConnection
}

export interface User {
    username: string,
    peerID: string
}

export interface Message {
    sent: boolean,
    seen: boolean,
    timestamp: string,
    from: string,
    to: string,
    text: string|false,
    image: {blob: Blob, type: string}|false
    attachment: {blob: Blob, type: string}|false
}

export interface Messages {
    [key: string]: Message[]
}





/***********************************************************
 * Redux specific
 */
export interface SystemState {
    user: User|false,
    isLoggedIn: boolean,
    token: string|false
    offline: boolean
}
  
export interface ChatStoreState {
    online: {[key: string]: User},
    connections: Connections,
    messages: Messages,
    selectedUser: User|false
}
  
export const ADD_CONNECTION = 'UPDATE_CONNECTIONS'
export const UPDATE_ONLINE = 'UPDATE_ONLINE'
export const UPDATE_MESSAGES = 'UPDATE_MESSAGES'
export const UPDATE_TOKEN = 'UPDATE_TOKEN'
export const UPDATE_LOGIN_STATE = 'UPDATE_LOGIN_STATE'
export const UPDATE_OFFLINE_STATE = 'UPDATE_OFFLINE_STATE'
export const UPDATE_SYSTEM_USER = 'UPDATE_SYSTEM_USER'
export const UPDATE_SYSTEM_PEER = 'UPDATE_SYSTEM_PEER'
export const UPDATE_SELECTED_USER = 'UPDATE_SELECTED_USER'
  
  
interface AddConnectionAction {
    type: typeof ADD_CONNECTION
    key: string,
    connection: any
}

interface UpdateOnlineAction {
    type: typeof UPDATE_ONLINE
    payload: {[key: string]: User}
}

interface UpdateMessagesAction {
    type: typeof UPDATE_MESSAGES,
    key: string,
    message: Message
}

interface UpdateTokenAction {
    type: typeof UPDATE_TOKEN
    token: string
}

interface UpdateLoginAction {
    type: typeof UPDATE_LOGIN_STATE
    isLoggedIn: boolean
}


interface UpdateOfflineAction {
    type: typeof UPDATE_OFFLINE_STATE
    offline: boolean
}


interface UpdateSystemUser {
    type: typeof UPDATE_SYSTEM_USER
    user: User|false
    isLoggedIn: boolean,
    offline: boolean,
    token: string|false
}

interface UpdateSystemPeer {
    type: typeof UPDATE_SYSTEM_PEER,
    peer: Peer
}

interface UpdateSelectedUserAction {
    type: typeof UPDATE_SELECTED_USER,
    user: User|false
}



export type ActionTypes = 
    AddConnectionAction | UpdateOnlineAction | 
    UpdateMessagesAction | UpdateTokenAction | 
    UpdateLoginAction | UpdateOfflineAction | 
    UpdateSystemUser | UpdateSystemPeer | UpdateSelectedUserAction


