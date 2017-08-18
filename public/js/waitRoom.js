$(function() {
  var option = location.href.split("?")[1].split("=")[1];
  var socket = io.connect(socketUrl);
  var userList = {}

  var updateSite = function() {

    var siteDom = $(".site")

    var i = 0;
    for(var p in userList) {

      siteDom.eq(0).attr("background", "url(" + baseUrl + userList[p].avatar + ")")
    }
  };

  var user = {
    userId: localStorage.getItem("userId"),
    name: localStorage.getItem("name"),
    avatar: localStorage.getItem("avatar")
  };

  socket.on('createRoom', function(data) {

    loading.hide();
    console.log(data);

    userList = merge({}, userList, data.userList)
    updateSite();

  });

  if(option === "create") {

    var loading = weui.loading("loading");
    console.log(user);
    socket.emit('createRoom', { user: user });
  }
});