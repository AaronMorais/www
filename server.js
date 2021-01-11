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

const diceGames = [
  '❤️',
  '🌎',
  '🧠',
  '✏️',
  '👂',
  '🗣️',
];

const diceChallenges = [
  'Solo',
  'Head 2 Head',
  'Free For All',
]

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
  const parse = require('csv-parse/lib/sync');
  const fs = require('fs');
  return shuffle(parse(fs.readFileSync(filepath), {columns: true}));
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
  stopwatch: null,
  score_boards: {},
  personal_boards: {},
  dice_game: '❤️',
  dice_challenge: null,
  game_title: null,
  game_description: null,
  game_answer: null,
}
let stopwatchInterval;

function sendState(socket) {
  socket.emit('state', globalState);
  socket.broadcast.emit('state', globalState);
  console.log(globalState);
}

io.on('connection', (socket) => {
  console.log('new connection', socket.id)
  globalState.score_boards[socket.id] = 0
  sendState(socket);

  socket.on('disconnect', (data) => {
    delete globalState.personal_boards[socket.id];
    delete globalState.score_boards[socket.id];
    sendState(socket);
  });

  socket.on('update_board', (data) => {
    globalState.personal_boards[socket.id] = data;
    sendState(socket);
  });

  socket.on('increment_score', (score) => {
    globalState.score_boards[socket.id] += score;
    if (globalState.score_boards[socket.id] < 0) {
      globalState.score_boards[socket.id] = 0
    }

    if (globalState.score_boards[socket.id] > 8) {
      globalState.score_boards[socket.id] = 8
    }
    sendState(socket);
  });

  socket.on('start_timer', (data) => {
    globalState.timer = 30;
    var timerInterval = setInterval(function(){
      globalState.timer--
      if (globalState.timer <= 0) {
        globalState.timer = null;
        clearInterval(timerInterval);
      }
      sendState(socket);
    }, 1000);
    sendState(socket);
  });

  socket.on('stop_timer', (data) => {
    globalState.timer = null;
  })

  socket.on('start_stopwatch', (data) => {
    globalState.stopwatch = 0;
    stopwatchInterval = setInterval(function(){
      globalState.stopwatch += 0.1
      sendState(socket);
    }, 100);
    sendState(socket);
  });

  socket.on('stop_stopwatch', (data) => {
    clearInterval(stopwatchInterval);
    sendState(socket);
  });

  socket.on('hide_stopwatch', (data) => {
    globalState.stopwatch = null;
    clearInterval(stopwatchInterval);
    sendState(socket);
  });

  socket.on('roll_dice', (data) => {
    const rolledGame = diceGames[Math.floor(Math.random()*diceGames.length)];
    const rolledChallenge = diceChallenges[Math.floor(Math.random()*diceChallenges.length)];
    globalState.dice_game = rolledGame;
    globalState.dice_challenge = rolledChallenge;
    globalState.game_title = null;
    globalState.game_description = null;
    globalState.game_answer = null;
    globalState.game_show_answer = false;
    sendState(socket);
  });

  socket.on('reveal_answer', (data) => {
    globalState.game_show_answer = true;
    sendState(socket);
  });

  socket.on('reveal', (type) => {
    const card = deck[type + '_cards'].pop();

    switch (type) {
      case 'a':
        globalState.game_title = card.loanword + " (" + card.language + ")";
        globalState.game_description = "What is the native meaning?";
        globalState.game_answer = card.answer;
        break;
      case 'aa':
        globalState.game_title =  card.translation;
        globalState.game_description = "From " + card.language + ": " + card.native + ".\nWhat is the meaning?";
        globalState.game_answer = card.answer;
        break;
      case 'b':
        globalState.game_title = card.question;
        globalState.game_description = "A) " + card.a + " B) " + card.b;
        if (card.c != "") {globalState.game_description += " C) " + card.c;}
        globalState.game_answer = card.answer + " | " + card.explanation;
        break;
      case 'bb':
        globalState.game_title = card.question;
        globalState.game_description = null;
        globalState.game_answer = card.answer;
        break;
      case 'c':
        globalState.game_title = "NAGARAM";
        globalState.game_description = card.board;
        globalState.game_answer = null;
        break;
      case 'cc':
        globalState.game_title = card.wordtype + ": " + card.definition + "\ne.g. " + card.example;
        globalState.game_description = card.challenge + "\n" + card.solo;
        globalState.game_answer = null;
        break;
      case 'd':
        globalState.game_title = "Give a rhyme for '" + card.rhyme + "'";
        globalState.game_description = "Minimum 5 rhyming words for Solo play.";
        globalState.game_answer = null;
        break;
      case 'dd':
        globalState.game_title = card.native;
        globalState.game_description = "From " + card.language + ".\nWhat's that sound?";
        globalState.game_answer = card.answer;
        break;
      case 'e':
        globalState.game_title = card.twister;
        globalState.game_description = "One attempt. No slip ups.";
        globalState.game_answer = null;
        break;
      case 'ee':
        globalState.game_title = card.phrase;
        globalState.game_description = "What's the phrase?";
        globalState.game_answer = card.answer;
        break;
    }
    globalState.game_show_answer = false;
    sendState(socket);
  });
});

// Don't do this in production!
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
