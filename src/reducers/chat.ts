import { ActionEject } from 'material-ui/svg-icons'
import { ChatStoreState, ActionTypes, ADD_CONNECTION, UPDATE_ONLINE, UPDATE_MESSAGES, UPDATE_SELECTED_USER, UPDATE_BULK_MESSAGES, USER_LOGOUT, UPDATE_CONNECTIONS, UPDATE_BULK_CONNECTIONS, UPDATE_MESSAGE_SEEN, UPDATE_USER_PROFILES, UPDATE_BULK_USER_PROFILES } from '../App.config'
import Messages from '../components/Messages'


const initialState: ChatStoreState = {
  online: {},
  connections: {},
  messages: {},
  selectedUser: false,
  userProfiles: {},
}

export function chat (
  state = initialState,
  action: ActionTypes
): ChatStoreState {

  switch (action.type) {

    case UPDATE_ONLINE:
      return {...state, online: action.payload}
    
    case UPDATE_BULK_CONNECTIONS:
      return {...state, connections: action.connections}

    case UPDATE_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.key]: (
            typeof state.messages[action.key] !== 'undefined' ? 
              [...state.messages[action.key], action.message] : 
              [action.message]
          )
        }
      }
    
    case UPDATE_USER_PROFILES:
      return {
        ...state,
        userProfiles: {
          ...state.userProfiles,
          [action.user_profile.username]: action.user_profile
        }
      }
    
    case UPDATE_BULK_USER_PROFILES:
      return {
        ...state,
        userProfiles: action.user_profiles
      }

    case UPDATE_BULK_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.key]: action.messages
        }
      }

    case UPDATE_SELECTED_USER:
      return {
        ...state,
        selectedUser: action.user
      }
      
    case USER_LOGOUT:
      return initialState;

    case UPDATE_CONNECTIONS:
      return {
        ...state,
        connections: {
          ...state.connections,
          [action.connection.username]: action.connection
        }
      }
    
    case UPDATE_MESSAGE_SEEN:
      return {
        ...state, 
        messages: {
          ...state.messages,
          [action.key]: state.messages[action.key].map((message) => {
            if (action.timestamp > message.timestamp) return {...message, seen: true}
            return message;
          })
        }     
      }
      
        
    default:
      return state
  
  }

}