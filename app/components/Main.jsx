import React, { useEffect } from 'react';
import { SocketIOContext, SocketIOProvider } from 'use-socketio';
import { Input, Button, Typography } from 'antd';
import generateName from 'sillyname';

const { Title } = Typography;
const { TextArea } = Input;

const App = function() {
  const socket = React.useContext(SocketIOContext);
  const [name, setName] = React.useState(generateName());
  const [timer, setTimer] = React.useState(null);
  const [globalBoard, setGlobalBoard] = React.useState('');
  const [personalBoards, setPersonalBoards] = React.useState(null);
  const [myBoard, setMyBoard] = React.useState('Hi friends!');
  const [diceRoll, setDiceRoll] = React.useState(null);
  const [gameTitle, setGameTitle] = React.useState(null);
  const [gameDescription, setGameDescription] = React.useState(null);

  useEffect(() => {
    if (!personalBoards) {
      socket.emit('update_board', {name: name, data: myBoard});
    }

    socket.on('state', (data) => {
      setTimer(data.timer);
      setGlobalBoard(data.global_board);
      setPersonalBoards(data.personal_boards);
      setDiceRoll(data.dice_roll);
      setGameTitle(data.game_title);
      setGameDescription(data.game_description);
    });
  }, [globalBoard, personalBoards, timer]);

  function onRollDice(e) {
    socket.emit('roll_dice')
  }
  function onRevealA(e) {
    socket.emit('reveal_a')
  }
  function onRevealB(e) {
    socket.emit('reveal_b')
  }
  function onRevealC(e) {
    socket.emit('reveal_c')
  }
  function onRevealD(e) {
    socket.emit('reveal_d')
  }
  function onTimerClick(e) {
    socket.emit('start_timer')
  }
  function onGlobalBoardChange(e) {
    setGlobalBoard(e.target.value)
    socket.emit('global_board', e.target.value)
  }
  function onMyBoardChange(e) {
    setMyBoard(e.target.value)
    socket.emit('update_board', {name: name, data: e.target.value})
  }
  function onNameChange(e) {
    setName(e.target.value)
    socket.emit('update_board', {name: e.target.value, data: myBoard})
  }
  
  return (
    <>
      <Title>Words With fWiends</Title>
      {gameTitle && (<Title level={3}>{gameTitle}</Title>)}
      {gameDescription && (<Title level={3}>{gameDescription}</Title>)}
      {diceRoll && (<Title level={3}>{diceRoll}</Title>)}
      {!timer && (<Button type="primary" onClick={onTimerClick}>Start Timer</Button>)}
      {timer && (<Title level={4}>Timer: {timer}</Title>)}
      <Button type="primary" onClick={onRollDice}>Roll Dice</Button>
      <Button type="primary" onClick={onRevealA}>Draw A</Button>
      <Button type="primary" onClick={onRevealB}>Draw B</Button>
      <Button type="primary" onClick={onRevealC}>Draw C</Button>
      <Button type="primary" onClick={onRevealD}>Draw D</Button>
      <Title level={4}>Leaderboard</Title>
      <TextArea value={globalBoard} onChange={onGlobalBoardChange} autoSize style={{fontFamily: 'courier'}}/>
      <Title level={4}>Player Boards</Title>
      {personalBoards && Object.keys(personalBoards).map(function(key, i) {
        if (key === socket.id) return <></>
        return (
          <>
            <Title level={4} key={key+'title'}>{personalBoards[key].name}</Title>
            <TextArea value={personalBoards[key].data} autoSize style={{fontFamily: 'courier'}} key={key+'text'}/>
          </>
        );
      })}
      <Title level={4}>Your Board</Title>
      <TextArea value={myBoard} onChange={onMyBoardChange} autoSize style={{fontFamily: 'courier'}}/>
      <Title level={4}>Your Name</Title>
      <TextArea value={name} onChange={onNameChange} autoSize style={{fontFamily: 'courier'}}/>
    </>
  );
}

const Main = () => (
  <SocketIOProvider url='http://localhost:8000'>
    <App/>
  </SocketIOProvider>
);

export default Main;