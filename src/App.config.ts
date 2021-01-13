import Peer from 'peerjs' // used for ChatState type

const CLIENT_KEY : string = 'AfxKcLYZTn9SWcDZL';

type LoginProps = {

}

type LoginState = {
  username: string,
  password: string,
  keepMeLoggedIn: true|false,
  isLoading: Boolean,
  isLoggedIn: Boolean,
  user: User
}

type ChatProps = {
    localPeer: Peer,
    user: User
  }
  
  type ChatState = {
    localPeer: Peer,
    user: User,
    remotePeers: User[],
    selectedRemotePeer: User,
    textMessage: string,
    connections: Connections,
    messages: Messages,
    lastMessage: Message|Object
  }

interface Connections {
    [key: string]: any
}

interface User {
    username: string,
    peerID: string,
    _id: string
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

export type {
    LoginProps,
    LoginState,
    ChatProps,
    ChatState,
    Connections,
    User,
    Message,
    Messages
}

export default {
    CLIENT_KEY
}