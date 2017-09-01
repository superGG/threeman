var socket = io.connect(socketUrl);

$(function() {

  var user = "";
  var userId = localStorage.getItem("userId");
  var roomId = localStorage.getItem("roomId");
  var inFlag = false;
  var role = localStorage.getItem("role");
  var loading = weui.loading('loading');
  var option = ''

  var inOtherTip = function() {
    weui.confirm('您已加入其他房间', {
      buttons: [{
          label: '回到房间',
          type: 'default',
          onClick: function(){
            window.location.href = "/waitRoom?roomId" + roomId
          }
      }, {
          label: '离开原房间，并继续操作',
          type: 'primary',
          onClick: function(){ 
            loading = weui.loading('loading');

            if(role == 1) {
              socket.emit('closeRoom', {
                roomId: roomId,
                user: user
              })
            }else {

              socket.emit('leaveRoom', {
                roomId: roomId,
                user: user
              })
            }
          }
      }]
    });
  }

  $.ajax({
    url: serverUrl + "user/getUserInfoById?userId=" + userId,
    method: "POST"
  }).success(function(data) {

    renderAvatar(data.result.name);
    $(".user-avatar .user-name").html(data.result.name);
    $(".user-avatar .count span").html(data.result.interal);
    user = data.result;
    localStorage.setItem("name", data.result.name);
    localStorage.setItem("avatar", data.result.image)
    localStorage.setItem("interal", data.result.interal)

    socket.emit("roomInfo", {
      roomId: roomId,
      user: data.result
    });
  })

  $("#create").click(function() {

    option = 'create';
    if(inFlag) {

      inOtherTip()
      return;
    }

    if(user.interal < 50) {

      weui.alert("您的积分不足，请先充值。")
      return;
    }

    loading = weui.loading('loading');
    socket.emit('createRoom', {
      user: user
    })
  })

  $('#join').click(function() {
    option = 'join';
    if(inFlag) {
      
      inOtherTip()
      return;
    }

    window.location.href = '/joinRoom'
  });

  socket.on('roomInfo', function(data) {
    loading.hide();
    console.log(data)
    if(data.error || data.result === false) {
      inFlag = false
    }else {
      inFlag = true
    }
  })

  socket.on('createRoom', function(data) {
    loading.hide();
    var roomId = data.room.roomId;

    localStorage.setItem('roomId', roomId);
    localStorage.setItem('role', 1);
    window.location.href = '/waitRoom?roomId=' + roomId;
  })  

  socket.on("closeRoom", function(data) {

    if(errorServer(data)) {
      return false
    }

    if(option === 'create') {

      socket.emit('createRoom', {
        user: user
      })
    }else {

      loading.hide()
      window.location.href = '/joinRoom'
    }
  });
  
  socket.on("leaveRoom", function(data) {
    
    if(errorServer(data)) {
      return false
    }

    if(option === 'create') {

      socket.emit('createRoom', {
        user: user
      })
    }else {

      loading.hide()
      window.location.href = '/joinRoom'
    }
  })
});