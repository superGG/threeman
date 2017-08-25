$(function() {
  var paramArr = location.href.split("?")[1].split("&");
  var socket = io.connect(socketUrl);
  var userList = {}, roomId = '', option = "";
  var userId = localStorage.getItem('userId');

  for(var i = 0, len = paramArr.length; i < len; i++) {

    if(paramArr[i].split("=")[0] === "option"){
      option = paramArr[i].split("=")[1];
    }else if(paramArr[i].split("=")[0] === "roomId") {
      roomId = paramArr[i].split("=")[1];
    }
  }

  var updateSite = function() {

    var siteDom = $(".site").css("background-image", "url(./kw.png)")

    var i = 0;
    for(var p in userList) {

      siteDom.eq(i).css("background-image", "url(adfadf" + baseUrl + userList[p].avatar + ")")
      i ++;
    }

    i = 0;
  };

  var user = {
    userId: localStorage.getItem("userId"),
    name: localStorage.getItem("name"),
    avatar: localStorage.getItem("avatar"),
    interal: localStorage.getItem("interal")
  };

  socket.on('createRoom', function(data) {

    loading.hide();
    if(errorServer(data)) {
      return false
    }

    console.log(data);

    userList = merge({}, userList, data.room.userList);
    roomId = data.room.roomId;
    updateSite();
    $("#room_code").val(testUrl + "/waitRoom?option=join&roomId=" + roomId)

  });

  socket.on("leaveRoom", function(data) {

    if(errorServer(data)) {
      return false
    }

    console.log('leave');
    console.log(data);

    if(data.leaveUser.userId == userId) {
      weui.toast("操作成功", {
        duration: 3000,
        callback: function(){ location.href = '/userInfo' }
      })
    }

    delete userList[data.leaveUser.userId];
    updateSite();

  });

  socket.on("joinRoom", function(data) {

    loading.hide();

    if(errorServer(data)) {
      return false
    }

    userList = data.room.userList;
    updateSite();

    console.log(userList)
  });

  socket.on("closeRoom", function(data) {

    if(errorServer(data)) {
      return false
    }

    Msgloading.hide();
    weui.topTips(data.message, {
      duration: 3000,
      callback: function(){ location.href = '/userInfo' }
    })
  });

  socket.on("setMinChip", function(data) {
    if(errorServer(data)) {
      return false
    }

    weui.topTips(data.message)

  });

  socket.on("startGame", function(data) {

    if(errorServer(data)) {
      return false
    }

    var role = option === "create" ? 1 : 2;

    weui.alert("游戏将在10s后开始，请设置手机为横屏模式。");

    setTimeout(function() {
      window.location.href = '/main?roomId=' + roomId + "&role=" + role;
    }, 3000)
  });

  if(option === "create") {

    var loading = weui.loading("loading");
    socket.emit('createRoom', { user: user });

    $("#cancel").css("display", "none");
  }

  if(option === "join") {

    var loading = weui.loading("请求中");

    $("#room_code").val(location.href)

    socket.emit("joinRoom", {
      user: user,
      roomId: roomId
    })

    $("#close").css("display", "none");
    $("#start").css("display", "none");
  }

  $("#cancel").click(function() {

    socket.emit("leaveRoom", {
      roomId: roomId,
      user: user
    }, function() {
      console.log("end")
    })
  });

  var Msgloading = "";
  $("#close").click(function() {

    Msgloading = weui.loading("请求中...")
    socket.emit("closeRoom", {
      roomId: roomId
    })
  })

  $(".copy").click(function() {

    var urlInput = $('#room_code').get(0);
    urlInput.select(); // 选择对象
    document.execCommand("Copy");
    console.log('copy');
  });

  $(".weui-select").change(function(e) {
    var value = e.target.value;
    socket.emit("setMinChip", {
      roomId: roomId,
      minChip: value
    })
  })

  $("#start").click(function() {

    socket.emit("startGame", {
      roomId: roomId
    })
  })
});

