import React, { useEffect } from 'react';
import { SocketIOContext, SocketIOProvider } from 'use-socketio';
import { Input, Button, Typography } from 'antd';
import generateName from 'sillyname';

const { Title } = Typography;
const { TextArea } = Input;

function precisionRoundMod(number, precision) {
  var factor = Math.pow(10, precision);
  var n = precision < 0 ? number : 0.01 / factor + number;
  return Math.round( n * factor) / factor;
}

const App = function() {
  const socket = React.useContext(SocketIOContext);
  const [name, setName] = React.useState(generateName());
  const [timer, setTimer] = React.useState(null);
  const [stopwatch, setStopwatch] = React.useState(null);
  const [globalBoard, setGlobalBoard] = React.useState('');
  const [personalBoards, setPersonalBoards] = React.useState(null);
  const [myBoard, setMyBoard] = React.useState('Hi friends!');
  const [diceRoll, setDiceRoll] = React.useState(null);
  const [gameTitle, setGameTitle] = React.useState(null);
  const [gameDescription, setGameDescription] = React.useState(null);
  const [gameAnswer, setGameAnswer] = React.useState(null);
  const [gameShowAnswer, setGameShowAnswer] = React.useState(null);

  useEffect(() => {
    if (!personalBoards) {
      socket.emit('update_board', {name: name, data: myBoard});
    }

    socket.on('state', (data) => {
      setTimer(data.timer);
      setStopwatch(data.stopwatch);
      setGlobalBoard(data.global_board);
      setPersonalBoards(data.personal_boards);
      setDiceRoll(data.dice_roll);
      setGameTitle(data.game_title);
      setGameDescription(data.game_description);
      setGameAnswer(data.game_answer);
      setGameShowAnswer(data.game_show_answer);
    });
  }, [globalBoard, personalBoards, timer, stopwatch]);

  function onRollDice(e) {
    socket.emit('roll_dice')
  }
  function onRevealAnswer(e) {
    socket.emit('reveal_answer')
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
  function onRevealE(e) {
    socket.emit('reveal_e')
  }
  function onRevealAA(e) {
    socket.emit('reveal_aa')
  }
  function onRevealBB(e) {
    socket.emit('reveal_bb')
  }
  function onRevealCC(e) {
    socket.emit('reveal_cc')
  }
  function onRevealDD(e) {
    socket.emit('reveal_dd')
  }
  function onRevealEE(e) {
    socket.emit('reveal_ee')
  }
  function onTimerClick(e) {
    socket.emit('start_timer')
  }
  function onTimerStop(e) {
    socket.emit('stop_timer')
  }
  function onStartStopwatch(e) {
    socket.emit('start_stopwatch')
  }
  function onStopStopwatch(e) {
    socket.emit('stop_stopwatch')
  }
  function onHideStopwatch(e) {
    socket.emit('hide_stopwatch')
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
    <div style={{margin: 10}}>
      <Title>Words With fWiends</Title>
      {diceRoll && (<Title level={3}>{diceRoll}</Title>)}
      <Button type="primary" onClick={onRollDice}>Roll Dice</Button>
      {!timer && (<Button type="primary" onClick={onTimerClick}>Start Timer</Button>)}
      {timer && (<Button type="primary" onClick={onTimerStop}>Stop Timer</Button>)}
      {!stopwatch && (<Button type="primary" onClick={onStartStopwatch}>Start Stopwatch</Button>)}
      {stopwatch && (<Button type="primary" onClick={onStopStopwatch}>Stop Stopwatch</Button>)}
      {stopwatch && (<Button type="primary" onClick={onHideStopwatch}>Clear Stopwatch</Button>)}
      <div></div>
      <Button type="primary" onClick={onRevealA}>Draw 🌎</Button>
      <Button type="primary" onClick={onRevealB}>Draw 🧠</Button>
      <Button type="primary" onClick={onRevealC}>Draw ✏️</Button>
      <Button type="primary" onClick={onRevealD}>Draw 👂</Button>
      <Button type="primary" onClick={onRevealE}>Draw 🗣️</Button>
      <div></div>
      <Button type="primary" onClick={onRevealAA}>Draw 🌎🌎</Button>
      <Button type="primary" onClick={onRevealBB}>Draw 🧠🧠</Button>
      <Button type="primary" onClick={onRevealCC}>Draw ✏️✏️</Button>
      <Button type="primary" onClick={onRevealDD}>Draw 👂👂</Button>
      <Button type="primary" onClick={onRevealEE}>Draw 🗣️🗣️</Button>
      {gameTitle && (<Title level={3}>{gameTitle}</Title>)}
      {gameDescription && (<Title level={3} style={{whiteSpace: "pre", fontFamily: 'courier'}}>{gameDescription}</Title>)}
      {timer && (<Title level={4}>Timer: {timer}</Title>)}
      {stopwatch != null && (<Title level={4}>Stopwatch: {precisionRoundMod(stopwatch, 1)}</Title>)}
      {gameAnswer && (<Button type="primary" onClick={onRevealAnswer}>Reveal Answer</Button>)}
      {gameAnswer && gameShowAnswer && (<Title level={3}>{gameAnswer}</Title>)}
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
    </div>
  );
}

const Main = () => (
  <SocketIOProvider url='http://localhost:8000'>
    <App/>
  </SocketIOProvider>
);

export default Main;