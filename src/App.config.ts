import Peer, { DataConnection } from 'peerjs' // used for ChatState type


const CLIENT_KEY : string = 'AfxKcLYZTn9SWcDZL';

type LoginProps = {

}

type LoginState = {
  username: string,
  password: string,
  isLoading: Boolean,
  isLoggedIn: Boolean,
  user: User,
  token: string|false,
}

type ChatProps = {
    user: User,
    token: string|false,
}
  
type ChatState = {
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

interface Connections {
    [key: string]: any
}

interface User {
    username: string,
    peerID: string
}
  
interface Message {
    message: { username: string, message: string},
    from: string,
    timestamp: string,
    seen: Boolean
}

interface Messages {
    [key: string]: Message[]
}

type MessagesProps = {
    messages: Message[],
    localUsername: string,
    remoteUsername: string,
    lastMessage: Message|Object
  }

export type {
    LoginProps,
    LoginState,
    ChatProps,
    ChatState,
    Connections,
    User,
    Message,
    Messages,
    MessagesProps
}

export default {
    CLIENT_KEY
}