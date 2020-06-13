import React, { useEffect } from 'react';
import { SocketIOContext, SocketIOProvider } from 'use-socketio';
import { Input, Button, Switch, Typography } from 'antd';
import generateName from 'sillyname';

const { Title, Text } = Typography;
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
  const [scoreBoard, setScoreBoard] = React.useState(null);
  const [personalBoards, setPersonalBoards] = React.useState(null);
  const [myBoardPrivate, setMyBoardPrivate] = React.useState(false);
  const [myBoard, setMyBoard] = React.useState('Hi friends!');
  const [diceGame, setDiceGame] = React.useState(null);
  const [diceChallenge, setDiceChallenge] = React.useState(null);
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
      setScoreBoard(data.score_boards);
      setPersonalBoards(data.personal_boards);
      setDiceGame(data.dice_game);
      setDiceChallenge(data.dice_challenge);
      setGameTitle(data.game_title);
      setGameDescription(data.game_description);
      setGameAnswer(data.game_answer);
      setGameShowAnswer(data.game_show_answer);
    });
  }, [scoreBoard, personalBoards, timer, stopwatch]);

  function onRollDice(e) {
    socket.emit('roll_dice')
  }
  function onRevealAnswer(e) {
    socket.emit('reveal_answer')
  }
  function reveal(type) {
    socket.emit('reveal', type)
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
  function incrementScore(type) {
    socket.emit('increment_score', type)
  }
  function onMyBoardChange(e) {
    let newBoard = e.target.value
    setMyBoard(newBoard)
    newBoard = myBoardPrivate ? newBoard.replace(/[^\s]/g, '*') : newBoard;
    socket.emit('update_board', {name: name, data: newBoard})
  }
  function onChangeMyBoardPrivate(enabled) {
    setMyBoardPrivate(enabled);
    const newBoard = enabled ? myBoard.replace(/[^\s]/g, '*') : myBoard;
    socket.emit('update_board', {name: name, data: newBoard})
  }
  function onNameChange(e) {
    setName(e.target.value)
    socket.emit('update_board', {name: e.target.value, data: myBoard})
  }

  console.log(scoreBoard);
  return (
    <div style={{margin: 10}}>
      <Title>Words With fWiends</Title>
      {diceGame && diceChallenge && (<Title level={3}>{diceGame} {diceChallenge}</Title>)}
      <Button type="primary" onClick={onRollDice}>Roll Dice</Button>
      {!timer && (<Button type="primary" onClick={onTimerClick}>Start Timer</Button>)}
      {timer && (<Button type="primary" onClick={onTimerStop}>Stop Timer</Button>)}
      {!stopwatch && (<Button type="primary" onClick={onStartStopwatch}>Start Stopwatch</Button>)}
      {stopwatch && (<Button type="primary" onClick={onStopStopwatch}>Stop Stopwatch</Button>)}
      {stopwatch && (<Button type="primary" onClick={onHideStopwatch}>Clear Stopwatch</Button>)}
      <br />
      {['🌎', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('a')}>Draw 🌎</Button>)}
      {['🧠', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('b')}>Draw 🧠</Button>)}
      {['✏️', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('c')}>Draw ✏️</Button>)}
      {['👂', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('d')}>Draw 👂</Button>)}
      {['🗣️', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('e')}>Draw 🗣️</Button>)}
      <br />
      {['🌎', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('aa')}>Draw 🌎🌎</Button>)}
      {['🧠', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('bb')}>Draw 🧠🧠</Button>)}
      {['✏️', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('cc')}>Draw ✏️✏️</Button>)}
      {['👂', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('dd')}>Draw 👂👂</Button>)}
      {['🗣️', '❤️'].includes(diceGame) && (<Button type="primary" onClick={() => reveal('ee')}>Draw 🗣️🗣️</Button>)}
      {gameTitle && (<Title level={3}>{gameTitle}</Title>)}
      {gameDescription && (<Title level={3} style={{whiteSpace: "pre", fontFamily: 'courier'}}>{gameDescription}</Title>)}
      {timer && (<Title level={4}>Timer: {timer}</Title>)}
      {stopwatch != null && (<Title level={4}>Stopwatch: {precisionRoundMod(stopwatch, 1)}</Title>)}
      {gameAnswer && (<Button type="primary" onClick={onRevealAnswer}>Reveal Answer</Button>)}
      {gameAnswer && gameShowAnswer && (<Title level={3}>{gameAnswer}</Title>)}
      <Title level={4}>Score Board</Title>
      {scoreBoard && Object.keys(scoreBoard).map(function(key, i) {
        if (!personalBoards || !(key in personalBoards)) return <div key={i} />;
        let text = personalBoards[key].name + ' ';
        text += ' 🌎 ' + scoreBoard[key]['A']
        text += ' 🧠 ' + scoreBoard[key]['B']
        text += ' ✏ ' + scoreBoard[key]['C']
        text += ' 👂 ' + scoreBoard[key]['D']
        text += ' 🗣 ' + scoreBoard[key]['E']
        return (
          <div key={i}>
            <Text key={i+'text'}>{text}</Text>
          </div>
        );
      })}
      <br />
      {<Button type="primary" onClick={()=>incrementScore('A')}>Add 🌎</Button>}
      {<Button type="primary" onClick={()=>incrementScore('B')}>Add 🧠</Button>}
      {<Button type="primary" onClick={()=>incrementScore('C')}>Add ✏</Button>}
      {<Button type="primary" onClick={()=>incrementScore('D')}>Add 👂</Button>}
      {<Button type="primary" onClick={()=>incrementScore('E')}>Add 🗣</Button>}
      <Title level={4}>Player Boards</Title>
      {personalBoards && Object.keys(personalBoards).map(function(key, i) {
        if (key === socket.id) return <div key={i} />;
        return (
          <div key={i}>
            <Title level={4} key={i+'title'}>{personalBoards[key].name}</Title>
            <TextArea value={personalBoards[key].data} autoSize style={{fontFamily: 'courier'}} key={i+'text'}/>
          </div>
        );
      })}
      <Title level={4}>Your Board</Title>
      <Text>Incognito Mode: <Switch checked={myBoardPrivate} onChange={onChangeMyBoardPrivate}/></Text>
      <TextArea value={myBoard} onChange={onMyBoardChange} autoSize style={{fontFamily: 'courier'}}/>
      <Title level={4}>Your Name</Title>
      <TextArea value={name} onChange={onNameChange} autoSize style={{fontFamily: 'courier'}}/>
    </div>
  );
}

const Main = () => (
  <SocketIOProvider url={window.location.href}>
    <App/>
  </SocketIOProvider>
);

export default Main;