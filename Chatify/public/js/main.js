const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//creaing a random number for colors in text

// var colorsArr = ['#4c8fcd','#d85700','#ceb86e','#558851'];

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

//Load all the chat
socket.on('output', function(data){
  if(data.length){
    chatMessages.innerHTML = '';
  
    for(var x = 0; x < data.length; x++){
      // var rndInt = Math.floor(Math.random() * 6) + 1;
      if(data[x].room === room){
      const div = document.createElement('div');
      div.classList.add('message');
      const p = document.createElement('p');
      p.classList.add('meta');
      p.innerText = data[x].name;
      p.innerHTML += `<span>${data[x].time}</span>`;
      div.appendChild(p);
      const para = document.createElement('p');
      // para.style.color = colorsArr[rndInt];
      para.classList.add('text');
      para.innerText = data[x].message;
      div.appendChild(para);  
      document.querySelector('.chat-messages').appendChild(div);
    }
  }
  }
  // if(data.length){
  //   for(var x = 0;x < data.length;x++){
  //     opMsg(data[x]);
  //   }
  // }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}); 
//handle the message to all the socket connections
socket.on('handleNewMsg', (newData) => {
  opMsg(newData);
});
// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room); 
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  outputMessage(message);
  // opMsg(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
  
  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//Output message to DOM from Mongo
function opMsg(data){
  for(var x = 0; x < data.length; x++){
  // var rndInt = Math.floor(Math.random() * 3) + 1;
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = data[0].username;
  p.innerHTML += `<span>${data[0].time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  // para.style.color = colorsArr[rndInt];
  para.innerText = data[0].text;
  div.appendChild(para);  
  document.querySelector('.chat-messages').appendChild(div);
}
chatMessages.scrollTop = chatMessages.scrollHeight;
}
// Output message to DOM
function outputMessage(message) {
  // var rndInt = Math.floor(Math.random() * 6) + 1;
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  // para.style.color = colorsArr[rndInt]
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
