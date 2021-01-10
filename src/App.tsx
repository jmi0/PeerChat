import Peer from 'peerjs'
import Chat from './components/Chat';
import LoginForm from './components/LoginForm'
import "./style/App.css";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom' 


const localPeer = new Peer({
  host: window.location.hostname,
  port: 9000, 
  path: '/peerserver',
  //debug: 3
});

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/login">
            <LoginForm />
          </Route>
          <Route path="/chat">
            <Chat localPeer={localPeer} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
