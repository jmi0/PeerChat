import Peer from 'peerjs'
import Chat from './components/Chat';
import "./style/App.css";


const localPeer = new Peer({
  host: window.location.hostname,
  port: 9000, 
  path: '/peerserver',
  //debug: 3
});

function App() {
  return (
    <div className="App">
      <Chat localPeer={localPeer} />
    </div>
  );
}

export default App;
