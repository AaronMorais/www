const process = require('process');
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + '/app/index.html');
});

var http = require('http');
var server = http.createServer(app);
// listen for requests :)
var listener = server.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

var io = require('socket.io')(server);

const dicePossibilities = [
  '❤️ Solo',
  '❤️ Head 2 Head',
  '❤️ Free for all',
  '🌎 Solo',
  '🌎 Head 2 Head',
  '🌎 Free for all',
  '🧠 Solo',
  '🧠 Head 2 Head',
  '🧠 Free for all',
  '✏️ Solo',
  '✏️ Head 2 Head',
  '✏️ Free for all',
  '👂 Solo',
  '👂 Head 2 Head',
  '👂 Free for all',
  '🗣️ Solo',
  '🗣️ Head 2 Head',
  '🗣️ Free for all',
];

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}
const deck = {
  a_cards: shuffle([
    {
      title: 'Title of a thing 1a',
      description: 'Description of a thing 1a',
    }, 
    {
      title: 'Title of a thing 2a',
      description: 'Description of a thing 2a',
    }, 
    {
      title: 'Title of a thing 3a',
      description: 'Description of a thing 3a',
    }, 
    {
      title: 'Title of a thing 4a',
      description: 'Description of a thing 4a',
    }, 
  ]),
  b_cards: shuffle([
    {
      title: 'Title of a thing 1b',
      description: 'Description of a thing 1b',
    }, 
    {
      title: 'Title of a thing 2b',
      description: 'Description of a thing 2b',
    }, 
    {
      title: 'Title of a thing 3b',
      description: 'Description of a thing 3b',
    }, 
    {
      title: 'Title of a thing 4b',
      description: 'Description of a thing 4b',
    }, 
  ]),
  c_cards: shuffle([
    {
      title: 'Title of a thing 1c',
      description: 'Description of a thing 1c',
    }, 
    {
      title: 'Title of a thing 2c',
      description: 'Description of a thing 2c',
    }, 
    {
      title: 'Title of a thing 3c',
      description: 'Description of a thing 3c',
    }, 
    {
      title: 'Title of a thing 4c',
      description: 'Description of a thing 4c',
    }, 
  ]),
  d_cards: shuffle([
    {
      title: 'Title of a thing 1d',
      description: 'Description of a thing 1d',
    }, 
    {
      title: 'Title of a thing 2d',
      description: 'Description of a thing 2d',
    }, 
    {
      title: 'Title of a thing 3d',
      description: 'Description of a thing 3d',
    }, 
    {
      title: 'Title of a thing 4d',
      description: 'Description of a thing 4d',
    }, 
  ]),
}

const globalState = {
  timer: null,
  global_board: `
  +--------+---+---+---+---+
  |        | A | B | C | D |
  +--------+---+---+---+---+
  | Aaron  |   |   |   |   |
  +--------+---+---+---+---+
  | Adrian |   |   |   |   |
  +--------+---+---+---+---+
  `,
  personal_boards: {},
  dice_roll: null,
  game_title: null,
  game_description: null,
}

function sendState(socket) {
  socket.emit('state', globalState);
  socket.broadcast.emit('state', globalState);
}

io.on('connection', (socket) => {
  console.log('new connection', socket.id)
  sendState(socket);

  socket.on('disconnect', (data) => {
    delete globalState.personal_boards[socket.id];
    sendState(socket);
  });
  socket.on('update_board', (data) => {
    globalState.personal_boards[socket.id] = data;
    sendState(socket);
  });

  socket.on('global_board', (data) => {
    globalState.global_board = data;
    sendState(socket);
  });
  socket.on('start_timer', (data) => {
    globalState.timer = 30;
    var timerInterval = setInterval(function(){
      globalState.timer--
      if (globalState.timer === 0) {
        globalState.timer = null;
        clearInterval(timerInterval);
      }
      sendState(socket);
    }, 1000);
    sendState(socket);
  });

  socket.on('roll_dice', (data) => {
    const randomPossibility = dicePossibilities[Math.floor(Math.random()*dicePossibilities.length)];
    globalState.dice_roll = randomPossibility;
    globalState.game_title = null;
    globalState.game_description = null;
    sendState(socket);
  });
  socket.on('reveal_a', (data) => {
    const card = deck.a_cards.pop();
    globalState.game_title = card.title;
    globalState.game_description = card.description;
    sendState(socket);
  });
  socket.on('reveal_b', (data) => {
    const card = deck.b_cards.pop();
    globalState.game_title = card.title;
    globalState.game_description = card.description;
    sendState(socket);
  });
  socket.on('reveal_c', (data) => {
    const card = deck.c_cards.pop();
    globalState.game_title = card.title;
    globalState.game_description = card.description;
    sendState(socket);
  });
  socket.on('reveal_d', (data) => {
    const card = deck.d_cards.pop();
    globalState.game_title = card.title;
    globalState.game_description = card.description;
    sendState(socket);
  });
});

// Don't do this in production!
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
