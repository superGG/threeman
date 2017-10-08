$(function() {
  var paramArr = location.href.split("?")[1].split("&");
  var socket = io.connect(socketUrl);
  var userList = {}, roomId = '', option = "";
  var userId = localStorage.getItem('userId');
  var Msgloading = "";
  var role = localStorage.getItem('role');

  if(!userId) {
    weui.alert('请先登录！', function() {
      window.location.href = '/'
    })
  }

  for(var i = 0, len = paramArr.length; i < len; i++) {

    if(paramArr[i].split("=")[0] === "roomId"){
      roomId = paramArr[i].split("=")[1];
    }
  }

  $(".room__id").html(roomId);

  var updateSite = function() {

    var siteDom = $(".site").css("background-image", "url(./kw.png)")

    var i = 0;
    for(var p in userList) {
      siteDom.eq(i).html('<div class="avatar" style="background-color:'+ randomColor() +';"><span>'+ userList[p].name +'</span></div>');
      i ++;
    }

    $('.weui-uploader__info').html(i + '/6')

    i = 0;
  };

  var user = {
    userId: localStorage.getItem("userId"),
    name: localStorage.getItem("name"),
    image: localStorage.getItem("avatar"),
    interal: localStorage.getItem("interal")
  };

  socket.emit('roomInfo', {
    roomId: roomId,
    user: user
  });

  socket.on('roomInfo', function(data) {

    if(errorServer(data)) {
      return;
    }

    userList = merge({}, userList, data.room.userList);
    updateSite()
  });

  socket.on("leaveRoom", function(data) {

    if(errorServer(data)) {
      return false
    }


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

    if(typeof loading === 'function')loading.hide();
    var role = localStorage.getItem('role');

    if(errorServer(data)) {
      return false
    }

    userList = data.room.userList;
    updateSite();

  });

  socket.on("removeRoom", function(data) {

    weui.topTips(data.message, {
      duration: 3000,
      callback: function() {
        location.href = '/userInfo'
      }
    })
  })

  socket.on("closeRoom", function(data) {

    if(errorServer(data)) {
      return false
    }

    console.log('close')
    
    if(typeof Msgloading === 'function')Msgloading.hide();
    weui.topTips(data.message, {
      duration: 1000,
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

    var role = localStorage.getItem("role");

    weui.alert("游戏将在10s后开始，请设置手机为横屏模式。");

    setTimeout(function() {
      window.location.href = '/main?roomId=' + roomId + "&role=" + role;
    }, 1000)
  });


  if(role == '1') {
    $("#cancel").css("display", "none");
  }else {
    $("#close").css("display", "none");
    $("#start").css("display", "none");
    $(".min__chip").css('display', 'none');
  }


  $("#cancel").click(function() {

    socket.emit("leaveRoom", {
      roomId: roomId,
      user: user
    }, function() {
    })
  });

  $("#close").click(function() {

    Msgloading = weui.loading("请求中...")
    socket.emit("closeRoom", {
      roomId: roomId
    })
  })

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


