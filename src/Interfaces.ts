
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
    Connections,
    User,
    Message,
    Messages
}