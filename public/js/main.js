window.onload = function() {

  var messages = [];
  var socket = io.connect('/');
  var field = document.getElementById('field');
  var sendButton = document.getElementById('send');
  var content = document.getElementById('content');
  var pushButton = document.getElementById('push-button');

  // create the sending audio beep tone
  var audio = new Audio();
  var wave = new RIFFWAVE();
  var data = [];
  wave.header.sampleRate = 22100;
  wave.header.numChannels = 2;
  var i = 0;
  while (i<1000000)
    data[i++] = 128+Math.round(127*Math.sin(i/10));
  wave.Make(data);
  audio.src = wave.dataURI;

  // create the receiving audio beep tone
  var audio2 = new Audio();
  wave = new RIFFWAVE();
  data = [];
  wave.header.sampleRate = 32100;
  wave.header.numChannels = 2;
  i = 0;
  while (i<1000000)
    data[i++] = 128+Math.round(127*Math.sin(i/10));
  wave.Make(data);
  audio2.src = wave.dataURI;

  var roomId;
  if (window.location.hash) {
    roomId = window.location.hash.substring(1);
  } else {
    roomId = makeid(5);
    window.location.hash = '#' + roomId;
  }

  socket.emit('room', roomId);

  socket.on('message', function (data) {
    if(data.message) {
      messages.push(data.message);
      var html = '';
      for(var i=0; i<messages.length; i++) {
        html += messages[i] + '<br />';
      }
      content.innerHTML = html;
    } else {
      console.log("There is a problem:", data);
    }
  });

  socket.on('beepStart', function() {
    audio2.play();
  });

  socket.on('beepEnd', function() {
    audio2.pause();
  });

  sendButton.onclick = function() {
    var text = field.value;
    socket.emit('send', { message: text, room: roomId });
  };

  pushButton.onmousedown = function () {
    audio.play();
    socket.emit('beepStart', { room: roomId });
  };

  pushButton.onmouseup = function () {
    audio.pause();
    socket.emit('beepEnd', { room: roomId });
  };

}

function makeid(len) {
  len = len || 5;
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(var i=0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}