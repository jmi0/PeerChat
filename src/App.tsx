import Login from './components/Login'
import "./style/App.scss";
import { configureStore } from '@reduxjs/toolkit';
import reducer from './reducers'

const store = configureStore({reducer: reducer});
store.subscribe(() => {
  console.log(store.getState())
})
store.dispatch({ type: 'UPDATE_CONNECTIONS', key: 'testkey', connection: false });
store.dispatch({ type: 'UPDATE_CONNECTIONS', key: 'testkey2', connection: false });
store.dispatch({ type: 'UPDATE_CONNECTIONS', key: 'testkey5', connection: false });
store.dispatch({ type: 'UPDATE_CONNECTIONS', key: 'testkey6', connection: false });
//store.dispatch({ type: 'UPDATE_ONLINE', payload: {test: {username: 'test', peerID: ''}, test2: {username: 'test2', peerID: ''}}});

function App() {

  return (
    <div className="App">
      <Login />
    </div>
  );

}

export default App;
