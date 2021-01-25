import { combineReducers } from 'redux'
import { chat } from  './chat'
import { system } from './system'
 
export default combineReducers({
  chat,
  system
})