let fs = require('fs');
let app = require('http').createServer(function(req, res){
  fs.readFile('socketTest.html', function(err, data){
    if(err){
      res.writeHead(500);
      return res.end('Error, cannot find index.');
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

const PORT = process.env.PORT || 3000;

let io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket){
  socket.on('SocketTest', function(data){
    let date = new Date();
    socket.emit('SocketTest', '[' + date + ']' + data);
  });
});

app.listen(PORT, function(req, res){
  console.log(`Listening on Port: ${PORT}`);
});