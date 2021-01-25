import Peer, { DataConnection } from 'peerjs' // used for ChatState type


const APP_CONFIG = {
    CLIENT_KEY: 'AfxKcLYZTn9SWcDZL',
};
export default APP_CONFIG;

export type LoginProps = {

}

export type LoginState = {
  username: string,
  password: string,
  isLoading: Boolean,
  isLoggedIn: Boolean,
  user: User,
  token: string|false,
}

export type ChatProps = {
    user: User,
    token: string|false,
}
  
export type ChatState = {
    peer: Peer|null,
    user: User,
    remotePeers: {[key: string]: User},
    onlinePeers: {[key: string]: User},
    selectedRemotePeer: User,
    textMessage: string,
    connections: Connections,
    messages: Messages,
    lastMessage: Message|Object,
    offline: Boolean,
    token: string|false,
    isConnecting: Boolean,
    emojiPickerOpen: Boolean
}

export interface Connections {
    [key: string]: any
}

export interface User {
    username: string,
    peerID: string
}
  
export interface Message {
    message: { username: string, message: string},
    from: string,
    timestamp: string,
    seen: Boolean
}

export interface Messages {
    [key: string]: Message[]
}

export type MessagesProps = {
    messages: Message[],
    localUsername: string,
    remoteUsername: string,
    lastMessage: Message|Object
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
    messages: Messages
}
  
export const ADD_CONNECTION = 'UPDATE_CONNECTIONS'
export const UPDATE_ONLINE = 'UPDATE_ONLINE'
export const UPDATE_MESSAGES = 'UPDATE_MESSAGES'
export const UPDATE_TOKEN = 'UPDATE_TOKEN'
export const UPDATE_LOGIN_STATE = 'UPDATE_LOGIN_STATE'
export const UPDATE_OFFLINE_STATE = 'UPDATE_OFFLINE_STATE'
export const UPDATE_SYSTEM_USER = 'UPDATE_SYSTEM_USER'
  
  
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
}



export type ActionTypes = AddConnectionAction | UpdateOnlineAction | UpdateMessagesAction | UpdateTokenAction | UpdateLoginAction | UpdateOfflineAction | UpdateSystemUser


