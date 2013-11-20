window.onload = function() {

  var messages = [];
  var socket = io.connect('/');
  var field = document.getElementById('field');
  var sendButton = document.getElementById('send');
  var content = document.getElementById('content');
  var pushButton = document.getElementById('push-button');
  var body = document.getElementsByTagName("body")[0];
  var start, end;
  var queue = [];

  // create the sending audio beep tone
  var waveLow = new RIFFWAVE();
  var data = [];
  waveLow.header.sampleRate = 22100;
  waveLow.header.numChannels = 2;
  var i = 0;
  while (i<1000000)
    data[i++] = 128+Math.round(127*Math.sin(i/10));
  waveLow.Make(data);
  var audio = new Audio();
  audio.src = waveLow.dataURI;

  // create the receiving audio beep tone
  var waveHigh = new RIFFWAVE();
  data = [];
  waveHigh.header.sampleRate = 32100;
  waveHigh.header.numChannels = 2;
  i = 0;
  while (i<1000000)
    data[i++] = 128+Math.round(127*Math.sin(i/10));
  waveHigh.Make(data);
  var audio2 = new Audio();
  audio2.src = waveHigh.dataURI;

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

  socket.on('beep', function(len) {
    if (audio2.paused) {
      playAudio(audio2, len);
    } else {
      queue.push(len);
      console.log(queue);
      checkQueue();
    }
  });

  var playAudio = function(audio, len) {
    audio.play();
    pushButton.className = 'key key-down';
    window.setTimeout(function() {
      audio.pause();
      pushButton.className = 'key key-up';
    }, len);
  };

  var checkQueue = function() {
    window.setTimeout(function() {
      if (audio2.paused) {
        if (queue.length > 0) {
          playAudio(audio2, queue.shift());
          checkQueue();
        }
      } else {
        checkQueue();
      }
    }, 300);
  }

  sendButton.onclick = function() {
    var text = field.value;
    field.value = '';
    socket.emit('send', { message: text, room: roomId });
  };

  var mousedown = function () {
    audio.play();
    pushButton.className = 'key key-down';
    start = +new Date();
  };

  var mouseup = function () {
    audio.pause();
    pushButton.className = 'key key-up';
    end = +new Date();
    var diff = end - start;
    socket.emit('beep', { len: diff, room: roomId });
  };

  pushButton.onmousedown = mousedown;
  pushButton.ontouchstart = mousedown;
  pushButton.onmouseup = mouseup;
  pushButton.ontouchend = mouseup;

  body.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode === 32 && evt.target.tagName.toLowerCase() !== 'input')
      mousedown();
  };

  body.onkeyup = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode === 32 && evt.target.tagName.toLowerCase() !== 'input')
      mouseup();
  };

}

function makeid(len) {
  len = len || 5;
  var text = '';
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for(var i=0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}