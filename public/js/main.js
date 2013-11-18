window.onload = function() {

  var messages = [];
  var socket = io.connect('/');
  var field = document.getElementById('field');
  var sendButton = document.getElementById('send');
  var content = document.getElementById('content');
  var pushButton = document.getElementById('push-button');
  var start, end;

  // var beep = new Howl({
  //   urls: ['/audio/beep.mp3', '/audio/beep.ogg', '/audio/beep.wav'],
  //   // loop: true
  // });

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

  sendButton.onclick = function() {
    var text = field.value;
    socket.emit('send', { message: text, room: roomId });
  };

  // pushButton.onmousedown = function() {
  //   socket.emit('beep', {});
  // }

  var audio = new Audio();
  var wave = new RIFFWAVE();
  var data = [];

  wave.header.sampleRate = 22100;
  wave.header.numChannels = 2;

  var i = 0;
  while (i<1000000) {
    data[i++] = 128+Math.round(127*Math.sin(i/10)); // left speaker
    // data[i++] = 128+Math.round(127*Math.sin(i/200)); // right speaker
  }

  wave.Make(data);
  audio.src = wave.dataURI;
  // audio.play();

  pushButton.onmousedown = function () {
    start = +new Date(); // get unix-timestamp in milliseconds
    // beep.play();
    audio.play();
  };


  pushButton.onmouseup = function () {
    end = +new Date();
    var diff = end - start; // time difference in milliseconds
    console.log(diff);
    audio.pause();
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