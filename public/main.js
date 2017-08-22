(function() {

  var siteNote = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five"
  };
  var socket = io.connect(socketUrl);
  var roomId = window.location.href.split("?")[1].split("=")[1];
  var userId = localStorage.getItem('userId');
  var user = {
    name: localStorage.getItem("name"),
    interal: localStorage.getItem("interal"),
    avatar: localStorage.getItem("avatar"),
    userId: localStorage.getItem("userId")
  };

  var tansferNumToPic = function(numArr) {

    return numArr.map(function(item, index){

      var num = Math.ceil(item / 4);
      var afr = item % 4 === 0 ? 3 : item % 4 - 1;

      return num + "_" + afr + ".png"
    })
  };


  /**
   * 渲染用户信息
   * @param userList
   */
  var renderUserInfo = function(userList) {

    /**
     * <div class="player one">
     <div class="userInfo">
     <div class="avatar">
     <img src="/user/2.png" alt="">
     </div>
     <span class="nick">放水淀粉</span>
     <span class="count">积分: 1000$</span>
     </div>
     <div class="pokerBg">
     <img src="/poker/pokerBg.png" alt="">
     <img src="/poker/pokerBg.png" alt="">
     <img src="/poker/pokerBg.png" alt="">
     </div>
     </div>
     */

    renderMyinfo(userList[userId]);
    delete userList[userId];

    var i = 1;
    var userStr = "";
    for(var p in userList) {

      var readyStr = userList[p].ready  ? '准备中' : '未准备';

      userStr = userStr + '<div class="player '+ siteNote[i]+ ' ' + i +'"><div class="userInfo">'
        + '<div class="avatar"><img src="'+ baseUrl + userList[p].avatar +'" alt=""></div>'
        + '<span class="nick">'+ userList[p].name +'</span><span class="count">积分: ' + userList[p].interal +'</span></div>'
        + '<div class="pokerBg"><img src="/poker/pokerBg.png" alt=""><img src="/poker/pokerBg.png" alt=""><img src="/poker/pokerBg.png" alt=""> </div>' +
        '<span class="ready">' + readyStr +'</span> </div>'
    }

    i = 0;
    $(".other").html(userStr);
  };

  /**
   * 渲染自己的信息
   * @param myInfo
   */
  var renderMyinfo = function(myInfo) {

    $(".my .userInfo .avatar img").attr("src", baseUrl + myInfo.avatar);
    $(".my .userInfo .nick").html(myInfo.name);
    $(".my .userInfo .count").html(myInfo.interal);
  };

   $('.option').on("click", "li", function(e) {

     var id = e.target.id;

     if(id === 'ready') {
       socket.emit("readyGame", {
         roomId: roomId,
         user: user
       })
     }
   });


  var renderOption = function(optionFlag) {

    $('.result_alert').css("display", "none");
    $('.option').css("display", "none");

    switch(optionFlag) {
      case 1:
        $('.option').css('display', 'block');
        var optionStr = '<h3>准备好了，就可以开始游戏啦！</h3><li id="ready">准备</li><li id="leaveTag">离开房间</li>';
        $('.option ul').html(optionStr);
        return;
      case 2:
        $('.option').css('display', 'block');
        $('.option ul').html('<h3>请等待其他玩家准备</h3>');
      default:
        return;
    }

  };


  // var myPokerPng = tansferNumToPic(myPoker);


  $(".my .poker img").each(function(i) {

    // $(this).attr("src", "/poker/" + myPokerPng[i])
  });

  socket.emit("roomInfo", {
    roomId: roomId
  });

  socket.on("roomInfo", function(data) {

    console.log(data);

    renderUserInfo(data.room.userList);
    renderOption(1);
  });

  socket.on("readyGame", function(data) {

    var readyUserId = data.readyUser.userId;

    if(userId === readyUserId) {

      renderOption(2)
    }else {

      $('.'+readyUserId+'.ready').html("准备中")
    }

  });

  var width = document.documentElement.clientWidth;
  var height =  document.documentElement.clientHeight;
  if( width < height ){
    console.log(width + " " + height);
    $print =  $('#print');
    $print.width(height);
    $print.height(width);
    $print.css('top',  (height-width)/2 );
    $print.css('left',  0-(height-width)/2 );
    $print.css('transform' , 'rotate(90deg)');
    $print.css('transform-origin' , '50% 50%');
  }

  var evt = "onorientationchange" in window ? "orientationchange" : "resize";

  window.addEventListener(evt, function() {
    console.log(evt);
    var width = document.documentElement.clientWidth;
    var height =  document.documentElement.clientHeight;
    $print =  $('#print');
    if( width > height ){

      $print.width(width);
      $print.height(height);
      $print.css('top',  0 );
      $print.css('left',  0 );
      $print.css('transform' , 'none');
      $print.css('transform-origin' , '50% 50%');
    }
    else{
      $print.width(height);
      $print.height(width);
      $print.css('top',  (height-width)/2 );
      $print.css('left',  0-(height-width)/2 );
      $print.css('transform' , 'rotate(90deg)');
      $print.css('transform-origin' , '50% 50%');
    }

  }, false);

})();