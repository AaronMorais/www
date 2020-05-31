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


function shuffle_deck(filepath) {
  const parse = require('csv-parse/lib/sync')
  const fs = require('fs')
  return shuffle(parse(fs.readFileSync(filepath), {columns: true}))
}

const deck = {
  a_cards: shuffle_deck('./cards/loanwords.csv'),
  b_cards: shuffle_deck('./cards/trivia.csv'),
  c_cards: shuffle_deck('./cards/nagaram.csv'),
  d_cards: shuffle_deck('./cards/rhyme_time.csv'),
  e_cards: shuffle_deck('./cards/tongue_twisters.csv'),
  aa_cards: shuffle_deck('./cards/both_worlds.csv'),
  bb_cards: shuffle_deck('./cards/trivia2.csv'),
  cc_cards: shuffle_deck('./cards/onyms.csv'),
  dd_cards: shuffle_deck('./cards/vroom_vroom.csv'),
  ee_cards: shuffle_deck('./cards/hive_ale_ding_leash.csv'),
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
  game_answer: null,
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
    globalState.game_answer = null
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_answer', (data) => {
    globalState.game_show_answer = true
    sendState(socket);
  });
  socket.on('reveal_a', (data) => {
    const card = deck.a_cards.pop();
    globalState.game_title = card.language;
    globalState.game_description = card.loanword;
    globalState.game_answer = card.answer
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_b', (data) => {
    const card = deck.b_cards.pop();
    globalState.game_title = card.question;
    globalState.game_description = "A) " + card.a + " B) " + card.b
    if (card.c != "") {globalState.game_description += " C) " + card.c;}
    globalState.game_answer = card.answer + " | " + card.explanation
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_c', (data) => {
    const card = deck.c_cards.pop();
    globalState.game_title = "NAGARAM";
    globalState.game_description = card.board;
    globalState.game_answer = null
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_d', (data) => {
    const card = deck.d_cards.pop();
    globalState.game_title = "RHYME TIME";
    globalState.game_description = card.rhyme;
    globalState.game_answer = null
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_e', (data) => {
    const card = deck.e_cards.pop();
    globalState.game_title = "TONGUE TWISTER";
    globalState.game_description = card.twister;
    globalState.game_answer = null
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_aa', (data) => {
    const card = deck.aa_cards.pop();
    globalState.game_title = card.language + ": " + card.native;
    globalState.game_description = card.translation;
    globalState.game_answer = card.answer
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_bb', (data) => {
    const card = deck.bb_cards.pop();
    globalState.game_title = card.question;
    globalState.game_description = null
    globalState.game_answer = card.answer
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_cc', (data) => {
    const card = deck.cc_cards.pop();
    globalState.game_title = card.wordtype + ": " + card.definition;
    globalState.game_description = card.challenge + "; e.g. " + card.example;
    globalState.game_answer = null
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_dd', (data) => {
    const card = deck.dd_cards.pop();
    globalState.game_title = card.native;
    globalState.game_description = "(" + card.language + ")";
    globalState.game_answer = card.answer
    globalState.game_show_answer = false
    sendState(socket);
  });
  socket.on('reveal_ee', (data) => {
    const card = deck.ee_cards.pop();
    globalState.game_title = card.phrase;
    globalState.game_description = null;
    globalState.game_answer = card.answer
    globalState.game_show_answer = false
    sendState(socket);
  });
});

// Don't do this in production!
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
