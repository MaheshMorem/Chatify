const mongo = require('mongodb').MongoClient;
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chatify';

//Connect to mongo
mongo.connect('mongodb://localhost:27017', function(err, client){
  if(err){
      throw err;
  }
  console.log("MongoDB Connected...")
// Run when client connects
  io.on('connection', socket => {
  let database = client.db('ChatMeDb');
  let chat = database.collection('AllChats');

  chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
    if(err){
      throw err;
    }
    //Emit the messege
    socket.emit('output', res);
  });
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to Chatify!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    var dbObj = formatMessage(user.username, msg , user.room);
    console.log(dbObj)
    let name = dbObj.username;
    let message = dbObj.text;
    let time = dbObj.time;
    let room = dbObj.room;

    if(name == '' || message == ''){ 
      //print msg to enter data 
    }
      else{
        chat.insertOne({name: name, message: message, time: time, room: room}), function(){
          
        }
        io.to(user.room).emit('handleNewMsg',[dbObj]);
        // chat.find().sort({_id:1}).toArray(function(err, res){
        //   if(err){
        //     throw err;
        //   }
        //   //Emit the messege
        //   socket.emit('output', res);
        // });
      }
    //io.to(user.room).emit('message', formatMessage(user.username, msg , user.room));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
