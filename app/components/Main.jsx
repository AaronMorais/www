const React = require('react');
const { SocketIOContext, SocketIOProvider } = require('use-socketio');
import { Button } from 'antd';


const App = function() {
  const socket = React.useContext(SocketIOContext);
  const [globalBoard, setGlobalBoard] = React.useState('');
  // React.useEffect(async () => {
  //   socket.emit('global_board', globalBoard)
  //   socket.on('state', (data) => {
  //     setGlobalBoard(data.global_board)
  //   })
  // });
  
  return (
    <div>
      <h1>Hello World!!!!</h1>
    </div>
  );
}

const Main = () => (
  <SocketIOProvider url='https://words-with-fwiends.glitch.me/'>
    <App />
  </SocketIOProvider>
);

module.exports = Main;