var express = require('express'),
    exphbs  = require('express3-handlebars');
var app = express();
var port = 3700;

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

console.log(__dirname);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('home');
});

var io = require('socket.io').listen(app.listen(port));
console.log('Listening on port ' + port);

io.sockets.on('connection', function (socket) {
  socket.emit('message', { message: 'welcome to the node-o-sphere' });
  socket.on('send', function (data) {
    io.sockets.emit('message', data);
  });
});