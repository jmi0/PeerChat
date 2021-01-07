import React from 'react';
import Peer from 'peerjs'
import Chat from './components/Chat';


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
