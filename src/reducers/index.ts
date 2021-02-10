/*
 * @Author: joe.iannone 
 * @Date: 2021-02-10 09:59:30 
 * @Last Modified by:   joe.iannone 
 * @Last Modified time: 2021-02-10 09:59:30 
 */

import { combineReducers } from 'redux'
import { chat } from  './chat'
import { system } from './system'
 
export default combineReducers({
  chat,
  system
})