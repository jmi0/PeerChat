import { ChatStoreState, ActionTypes, ADD_CONNECTION, UPDATE_ONLINE, UPDATE_MESSAGES } from '../App.config'


const initialState: ChatStoreState = {
  online: {},
  connections: {},
  messages: {}
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
        messages:{
          ...state.messages,
          [action.key]: (
            state.messages[action.key] ? 
              [...state.messages[action.key], action.message] : 
              [action.message]
          )
        }
      }

    default:
      return state
  
  }
}