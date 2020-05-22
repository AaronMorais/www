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

const globalState = {
  timer: 0,
  global_board: 'Hello World!',
  personal_boards: {},
}

io.on('connection', (socket) => {
  socket.emit('state', JSON.stringify(globalState));
  socket.on('remove_board', (data) => {
    delete globalState.personal_boards[data];
    socket.emit('state', JSON.stringify(globalState));
  });
  socket.on('global_board', (data) => {
    globalState.global_board = data;
    socket.emit('state', JSON.stringify(globalState));
  });
  socket.on('personal_board', (data) => {
    console.log(data);
    globalState.personal_boards[data.name] = data.data;
    socket.emit('state', JSON.stringify(globalState));
  });
  socket.on('start_timer', (data) => {
    globalState.timer = Date.now();
    socket.emit('state', JSON.stringify(globalState));
  });
});

// Don't do this in production!
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
