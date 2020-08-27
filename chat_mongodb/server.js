const mongo = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const client = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
users = [];
connection = [];

// url = mongodb://127.0.0.1/mongochat


// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', { useUnifiedTopology: true, useNewUrlParser: true}, function(err, dbObj){
  if(err){
    throw err;
  }
  console.log(`MongoDB connected...`);

  // mongo v 3.0.0 up , the param of db is refered as an object
  let db = dbObj.db('mongochat');
  // Connect to Socket.io
  client.on('connection', function(socket){
    let chat = db.collection('chats');

    /*
    // Socket Connect Msg
    connections.push(socket);
    console.log('Connection: %s sockets connected', connections.length);
    // Socket Disconnect Msg
    socket.on('disconnect', function(data){
      users.splice(users.indexOf(socket.usernmae), 1);
      updateUsernames();
      connections.splice(connections.indexOf(socket), 1);
      console.log('Disconnected: %s sockets connected', connections.length);
    });
    socket.on('new user', function(data, callback){
      callback(true);
      socket.username = data;
      users.push(socket.username);
      updateUsernames();
    });
    function updateUsernames(){
      io.sockets.emit('get users', users);
    }*/
  
  
    // Create function to send status
    sendStatus = function(s){
      socket.emit('status', s);
    }

    // Get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if(err){
        throw err;
      }

      // Emit the messages
      socket.emit('output', res);
    });

    // Handle input events
    socket.on('input', function(data){
      let name = data.name;
      let message = data.message;
      if(name == '' || message == ''){
        // Send error status
        sendStatus('Please Enter your name and message');
      } else {
        // Insert message
        chat.insertOne({ name: name, message: message}, function(){
          client.emit('output', [data]);
          // Send status object 
          sendStatus({
            message: 'Message sent', 
            clear: true,
          });
        });
      }
    });

    // Handle clear
    socket.on('clear', function(data){
      // Remove all chats from collection
      chat.removeOne({}, function(){
        // Emit cleared
        socket.emit('cleared');
        sendStatus('Msg are cleared!');
      });
    });
  });
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


const server = http.listen(3000, function(){
  console.log("Listening on 3000");
});