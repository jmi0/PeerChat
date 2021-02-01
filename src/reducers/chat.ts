import { ChatStoreState, ActionTypes, ADD_CONNECTION, UPDATE_ONLINE, UPDATE_MESSAGES, UPDATE_SELECTED_USER, UPDATE_BULK_MESSAGES, USER_LOGOUT, UPDATE_CONNECTIONS, UPDATE_BULK_CONNECTIONS } from '../App.config'


const initialState: ChatStoreState = {
  online: {},
  connections: {},
  messages: {},
  selectedUser: false
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
          [action.key]: (
            typeof state.messages[action.key] !== 'undefined' ? 
              [...state.messages[action.key], action.message] : 
              [action.message]
          )
        }
      }

    case UPDATE_BULK_MESSAGES:
      return {
        ...state,
        messages: {
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
        
    default:
      return state
  
  }

}