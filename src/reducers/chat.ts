import { ChatStoreState, ActionTypes, ADD_CONNECTION, UPDATE_ONLINE, UPDATE_MESSAGES, UPDATE_SELECTED_USER, UPDATE_BULK_MESSAGES } from '../App.config'


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

    case ADD_CONNECTION:
      return {
        ...state, 
        connections: {
          ...state.connections,
          [action.key]: action.connection
        }
      }

    case UPDATE_ONLINE:
      return {...state, online: action.payload}

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

    default:
      return state
  
  }
}