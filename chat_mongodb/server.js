const mongo = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const client = require('socket.io')(http);

const PORT = process.env.PORT || 3000;


// url = mongodb://127.0.0.1/mongochat


// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', { useUnifiedTopology: true, useNewUrlParser: true}, function(err, dbObj){
  if(err){
    throw err;
  }

  console.log(`MongoDB connected...`);
  let db = dbObj.db('mongochat');
  // Connect to Socket.io
  client.on('connection', function(socket){
    let chat = db.collection('chats');

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
        chat.insert({ name: name, message: message}, function(){
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
      chat.remove({}, function(){
        // Emit cleared
        socket.emit('cleared');
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