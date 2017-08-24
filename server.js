const path = require('path');
const express = require('express');

const app = new express();
const port = 3000;

app.use(express.static("public"));

const sockets = require('socket.io')();
const UUID = require('node-uuid')

const poker = {};

var connectionList = {};
var roomList = {};
sockets.on('connection', function (socket) {
  //客户端连接时，保存socketId
  var socketId = socket.id;
  connectionList[socketId] = {
    socket: socket
  };

  //测试socket通信是否正常
  socket.on('test', function (data) {
    console.log(UUID.v1())
    socket.emit('test', data);
  });

  /**
   * 创建房间
   */
  socket.on('createRoom',function (data) {
    var user = data.user
    if (checkUser(user)) {
      socket.emit('createRoom', {result:false, message:"用户已经加入别的房间"});
      return;
    }
    var room = {};
    room.userList = {};
    room.roomId = UUID.v1();
    room.userList[user.userId] = user;
    room.userList[user.userId].ready = false;
    room.poker = poker;
    socket.join(room.roomId)
    roomList[room.roomId] = room;
    var result = {result:true,room}
    console.log(user.name+"用户创建"+room.roomId+"房间")
    // sockets.to(room.roomId).emit('test', result);
    sockets.to(room.roomId).emit('createRoom', result);
  });

  /**
   * 加入房间
   */
  socket.on('joinRoom',function (data) {
    var {roomId,user} = data
    var room = roomList[roomId]
    if (room != null) {
      if (checkUser(user)) {
        socket.emit('joinRoom', {result:false, message:"用户已经加入别的房间"});
        return;
      }
      room.userList[user.userId] = user;
      room.userList[user.userId].ready = false;
      socket.join(roomId)
      // console.log(roomList)
      console.log( user.name + "加入" + roomId +"房间")
      var result = {result:true,room}
      sockets.to(roomId).emit('joinRoom', result);
      // socket.emit('joinRoom', {result:true, message:"用户加入成功"});
    }
  })

  /**
   * 离开房间
   */
  socket.on('leaveRoom',function (data) {
    var {roomId,user} = data
    var room = roomList[roomId]
    if (room != null) {
      if (!checkUser(user)) {
        socket.emit('leaveRoom', {result:false, message:"该用户没有加入房间"});
        return;
      }
      delete roomList[roomId].userList[user.userId]
      socket.leave(roomId)
      var result = {result:true,leaveUser:user}
      console.log(user.name + "离开了房间")
      sockets.to(roomId).emit('leaveRoom', result);
      // socket.emit('leaveRoom', {result:true, message:"该用户离开了房间"});
    }
  })

  /**
   * 关闭房间
   */
  socket.on('closeRoom', function (data) {
    var roomId = data.roomId;
    delete roomList[roomId];
    socket.leave(roomId)
    console.log(roomId+"房间关闭")
    socket.emit('closeRoom',{result:true,message:"房主关闭房间"})
    sockets.to(roomId).emit('closeRoom',{result:true,message:"房主关闭房间"})
  })

  /**
   * 准备游戏
   */
  socket.on('readyGame',function (date) {
    var {roomId,user} = data;
    // var room = roomList[roomId]
    if (roomList[roomId] != null) {
      if (!checkUser(user)) {
        socket.emit('readyGame', {result:false, message:"该用户没有加入房间"});
        return;
      }
      roomList[roomId].userList[user.userId].ready = true
      if (isStartGame(roomList[roomId])) {  //判断是否可以直接开始游戏
        sockets.to(roomId).emit('startGame', {room:roomList[roomId]});
        return;
      }
      var result = {result:true,readyUser:user,room:roomList[roomId]}
      console.log(roomId+"房间的"+user.name + "准备开始游戏")
      sockets.to(roomId).emit('readyGame', result);
      socket.emit('readyGame', {result:true, message:"准备成功"});
    }
  })

  /**
   * 取消准备游戏
   */
  socket.on('cancleReady',function (date) {
    var {roomId,user} = data;
    var room = roomList[roomId]
    if (room != null) {
      if (!checkUser(user)) {
        socket.emit('cancleReady', {result:false, message:"该用户没有加入房间"});
        return;
      }
      roomList[roomId].userList[user.userId].ready = false

      var result = {result:true,readyUser:user,room:roomList[roomId]}
      console.log(roomId+"房间的"+user.name + "取消准备")
      sockets.to(roomId).emit('cancleReady', result);
      socket.emit('cancleReady', {result:true, message:"取消准备成功"});
    }
  })
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "pages", 'login.html'));
});

app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "main.html"))
});

app.get('/register', (req, res) => {

  res.sendFile(path.join(__dirname, "pages", "register.html"));
})

app.get("/set_user_info", (req, res) => {

  res.sendFile(path.join(__dirname, "pages", "userInfoSet.html"));
})

app.get("/userInfo", (req, res) => {

  res.sendFile(path.join(__dirname, "pages", "userInfo.html"));
})

app.get("/waitRoom", (req, res) => {

  res.sendFile(path.join(__dirname, "pages", "waitRoom.html"))
})

app.get("/socket", (req, res) => {

  res.sendFile(path.join(__dirname, "socketTest.html"))
});

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port);
}
});

sockets.listen(2727);


/**
 * 判断用户是否已经加入房间
 * @param user
 * @returns {boolean}
 */
function checkUser(user) {
  if (roomList == null) return false;
  var result = false;
  for (var roomId in roomList) {
    var userList = roomList[roomId].userList
    if (userList == null) continue;
    if(userList.hasOwnProperty(user.userId)) result = true;
  }
  return result;
}

/**
 * 判断是否可以开始游戏
 * @param room
 */
function isStartGame(room) {
  var users = room.userList;
  for(var userId in users) {
    var user = users[userId];
    if (!user.ready) return false; //只要有一个没有准备，都不能开始
  }
  return true;
}



