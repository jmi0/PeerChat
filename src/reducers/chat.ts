import {
  ChatState,
  ActionTypes,
  UPDATE_CONNECTIONS,
  UPDATE_ONLINE
} from '../actionTypes'


const initialState: ChatState = {
  online: {},
  connections: {},
  messages: {}
}

export function chat (
  state = initialState,
  action: ActionTypes
): ChatState {
  switch (action.type) {
    case UPDATE_CONNECTIONS:
      return {
        ...state, 
        connections: {
          ...state.connections,
          [action.key]: action.connection
        }
      }
    case UPDATE_ONLINE:
      return Object.assign({}, state, {online: action.payload});
    default:
      return state
  }
}