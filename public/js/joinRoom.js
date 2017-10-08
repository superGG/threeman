var socket = io.connect(socketUrl);

$(function() {

  var roomId = '';
  var loading = '';

  $('#comfir').click(function() {

    var user = {
      userId: localStorage.getItem("userId"),
      name: localStorage.getItem("name"),
      interal: localStorage.getItem("interal")
    };

    if(!user.userId) {
      weui.alert('请先登录！', function() {
        window.location.href = '/'
      })
    }

    loading = weui.loading('loading');

    roomId = $("#code").val();
    socket.emit("joinRoom", {
      user: user,
      roomId: roomId
    })
  })

  socket.on("joinRoom", function(data) {

    loading.hide();
    if(errorServer(data)) {

      return;
    }

    localStorage.setItem('roomId', roomId);
    localStorage.setItem('role', 2);

    window.location.href = '/waitRoom?roomId=' + roomId;
  })

})