/*
 * @Author: joe.iannone 
 * @Date: 2021-02-09 23:11:25 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:49:03
 */


import Peer, { DataConnection } from 'peerjs'
import Dexie from 'dexie'

const APP_CONFIG = {

    CLIENT_KEY: 'AfxKcLYZTn9SWcDZL',

};


export default APP_CONFIG;


/**
 * General interfaces
 */
export interface Connections {
    [key: string]: User
}

export interface User {
    username: string,
    peerID: string
}

export interface UserProfile {
    username: string,
    firstname?: string,
    lastname?: string,
    profilepic?: string,
    bio?: string,
    headline?: string
}

export interface UserSettings {
    username: string,
    allowOffline: boolean,
    deleteMessagesOnLogout: boolean
}

export interface Message {
    sent: boolean,
    seen: boolean,
    timestamp: string,
    from: string,
    to: string,
    text: string | false,
    image: string | false
    attachment: string | false
    id?: number,
    groupkey?: string
}

export interface Messages {
    [key: string]: Message[]
}

export interface UserProfiles {
    [key: string]: UserProfile
}

export type PeerBarProps = {
    token: string,
    peer: Peer,
    user: User,
    userSettings: UserSettings | false,
    userProfiles: UserProfiles,
    selectedUser: User | false,
    connections: Connections,
    online: Connections,
    messages: Messages,
    db: Dexie,
    dispatch: any
}

export type ChatHeaderProps = {
    selectedUser: User,
    selectedUserProfile: UserProfile | false
    isOnline: boolean,
    dispatch: any
}

export type ConnectionsProps = {
    user: User,
    selectedUser: User | false,
    userProfiles: UserProfiles,
    connections: Connections,
    online: Connections,
    messages: Messages,
    token: string,
    db: Dexie,
    dispatch: any
}

export type MessagesProps = {
    messages: Message[],
    localUsername: string,
    remoteUsername: string,
    localProfile: UserProfile | false,
    remoteProfile: UserProfile | false,
    db: Dexie,
    dispatch: any
}

export type MessengerProps = {
    peer: Peer,
    remotePeerID: string | false,
    selectedUser: User,
    systemUser: User,
    userProfile: UserProfile | false,
    db: Dexie,
    dispatch: any
}

export type MessengerState = {
    connection: DataConnection | false,
    text: string,
    image: string | false,
    attachment: string | false,
    emojiPickerOpen: boolean
}

export type OnlineListProps = {
    user: User,
    online: Connections,
    db: Dexie,
    dispatch: any
}

export type ProfileFormProps = {
    user: User,
    profile: UserProfile,
    db: Dexie,
    dispatch: any
}

export type SettingsFormProps = {
    user: User,
    userSettings: UserSettings | false,
    db: Dexie,
    dispatch: any
}


/**
 * interfaces for redux store
 */
export interface SystemState {
    user: User | false,
    isLoggedIn: boolean,
    token: string | false
    offline: boolean,
    userSettings: UserSettings | false
}

export interface ChatStoreState {
    online: Connections,
    connections: Connections,
    messages: Messages,
    selectedUser: User | false,
    userProfiles: UserProfiles
}

/**
 * redux action types
 */
export const ADD_CONNECTION = 'UPDATE_CONNECTIONS'
export const UPDATE_CONNECTIONS = 'UPDATE_CONNECTIONS'
export const UPDATE_ONLINE = 'UPDATE_ONLINE'
export const UPDATE_MESSAGES = 'UPDATE_MESSAGES'
export const UPDATE_TOKEN = 'UPDATE_TOKEN'
export const UPDATE_LOGIN_STATE = 'UPDATE_LOGIN_STATE'
export const UPDATE_OFFLINE_STATE = 'UPDATE_OFFLINE_STATE'
export const UPDATE_SYSTEM_USER = 'UPDATE_SYSTEM_USER'
export const UPDATE_SYSTEM_PEER = 'UPDATE_SYSTEM_PEER'
export const UPDATE_SELECTED_USER = 'UPDATE_SELECTED_USER'
export const UPDATE_BULK_MESSAGES = 'UPDATE_BULK_MESSAGES'
export const USER_LOGOUT = 'USER_LOGOUT'
export const UPDATE_BULK_CONNECTIONS = 'UPDATE_BULK_CONNECTIONS'
export const UPDATE_MESSAGE_SEEN = 'UPDATE_MESSAGE_SEEN'
export const UPDATE_USER_PROFILES = 'UPDATE_USER_PROFILES'
export const UPDATE_BULK_USER_PROFILES = 'UPDATE_BULK_USER_PROFILES'
export const UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS'

interface AddConnectionAction {
    type: typeof ADD_CONNECTION
    key: string,
    connection: any
}

interface UpdateConnectionsAction {
    type: typeof UPDATE_CONNECTIONS,
    connection: User
}

interface UpdateBulkConnectionsAction {
    type: typeof UPDATE_BULK_CONNECTIONS,
    connections: Connections
}

interface UpdateOnlineAction {
    type: typeof UPDATE_ONLINE
    payload: Connections
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
    user: User | false
    isLoggedIn: boolean,
    offline: boolean,
    token: string | false
}

interface UpdateSystemPeer {
    type: typeof UPDATE_SYSTEM_PEER,
    peer: Peer
}

interface UpdateSelectedUserAction {
    type: typeof UPDATE_SELECTED_USER,
    user: User | false
}

interface UpdateBulkMessagesAction {
    type: typeof UPDATE_BULK_MESSAGES,
    key: string,
    messages: Message[]
}

interface UserLogoutAction {
    type: typeof USER_LOGOUT
}

interface UpdateMessageSeenAction {
    type: typeof UPDATE_MESSAGE_SEEN
    key: string
    timestamp: string
}

interface UpdateUserProfilesAction {
    type: typeof UPDATE_USER_PROFILES,
    user_profile: UserProfile
}

interface UpdateBulkUserProfilesAction {
    type: typeof UPDATE_BULK_USER_PROFILES,
    user_profiles: UserProfiles
}

interface UpdateUserSettingsAction {
    type: typeof UPDATE_USER_SETTINGS,
    user_settings: UserSettings
}


export type ActionTypes =
    AddConnectionAction | UpdateOnlineAction |
    UpdateMessagesAction | UpdateTokenAction |
    UpdateLoginAction | UpdateOfflineAction |
    UpdateSystemUser | UpdateSystemPeer |
    UpdateSelectedUserAction | UpdateBulkMessagesAction |
    UserLogoutAction | UpdateConnectionsAction |
    UpdateBulkConnectionsAction | UpdateMessageSeenAction |
    UpdateUserProfilesAction | UpdateBulkUserProfilesAction | UpdateUserSettingsAction


