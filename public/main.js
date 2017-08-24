(function() {

  var siteNote = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five"
  };

  var chip = 0;

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
   * 渲染用户扑克信息
   * @param poker
   * @returns {string}
   */
  var renderPoker = function(poker) {

    if(!poker) {
      return '';
    }

    var pokerStr = '';
    poker.forEach(function(item, index) {

      var pokerSrc = item.number + "_" + (item.color -  1) + ".png";
      pokerStr = pokerStr + '<div class="poker__out"><div class="poker__bg"></div>' +
        '<div class="poker__a" style="background-image:url(/poker/' + pokerSrc +');"></div></div>';
    });


    return pokerStr;
  };

  /**
   * 渲染用户信息
   * @param userList
   */
  var renderUserInfo = function(userList) {

    renderMyinfo(userList[userId]);
    delete userList[userId];

    var i = 1;
    var userStr = "";
    for(var p in userList) {

      var readyStr = userList[p].ready  ? '准备中' : '未准备';

      userStr = '<div class="player '+ siteNote[i]+ ' user' + userList[p].userId +'"><div class="userInfo">'
        + '<div class="avatar"><img src="'+ baseUrl + userList[p].avatar +'" alt=""></div>'
        + '<span class="nick">'+ userList[p].name +'</span><span class="count">积分: ' + userList[p].interal +'</span></div>'
        + '<div class="pokerBg">' + renderPoker(userList[p].poker) + '</div>' +
        '<span class="ready">' + readyStr +'</span> <span class="money">下注：50积分</span></div>'
    }

    i = 0;
    $(".other").html($(".other").html() + userStr);
  };

  /**
   * 渲染自己的信息
   * @param myInfo
   */
  var renderMyinfo = function(myInfo) {

    $(".my .userInfo .avatar img").attr("src", baseUrl + myInfo.avatar);
    $(".my .userInfo .nick").html(myInfo.name);
    $(".my .userInfo .count").html(myInfo.interal);
    $(".my .poker").html(renderPoker(myInfo.poker));
  };

   $('.option').on("click", "li", function(e) {

     var id = e.target.id;
     var type = e.target.type;

     console.log(type);

     if(type === 'chip') {

       var val = e.target.innerHTML;
       console.log(val);
       socket.emit('bet', {
         roomId: roomId,
         user: user,
         money: val
       });

       return;
     }

     if(id === 'ready') {
       socket.emit("readyGame", {
         roomId: roomId,
         user: user
       })
     }
   });

  /**
   * 渲染投注选项
   * @returns {string}
   */
  var renderChipOption = function() {

     var multiple = [1, 2, 4, 6, 8, 10];

     var optionStr = "<h3>请选择你要投放的注数</h3>";
     multiple.forEach(function(item, index) {

       optionStr = optionStr + "<li val="+ chip * item+" type='chip'>" + chip * item +"</li>";
     });

     return optionStr;
   };


  /**
   * 渲染操作区
   * @param optionFlag
   */
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
        return;
      case 3:
        $('.option').css('display', 'block');
        $('.option ul').html(renderChipOption());
        $('.ready').css("display", "none");
        return;
      default:
        return;
    }

  };


  // var myPokerPng = tansferNumToPic(myPoker);


  $(".my .poker img").each(function(i) {

    // $(this).attr("src", "/poker/" + myPokerPng[i])
  });



  socket.emit("roomInfo", {
    roomId: roomId,
    user: user
  });

  socket.on("roomInfo", function(data) {

    console.log(data);

    chip = data.room.minChip;
    renderUserInfo(data.room.userList);
    renderOption(1);
  });

  socket.on("readyGame", function(data) {

    if(data.allReady) {

      renderOption(3);
      return
    }

    var readyUserId = data.readyUser.userId;

    if(userId === readyUserId) {

      renderOption(2)
    }else {

      $('.user'+readyUserId+' .ready').html("准备中").css('color','#ffb422')
    }

  });

  socket.on('bet', function(data) {
    var betUser = data.betUser;
    var chip = data.money;

    if(user.userId === betUser.userId) {
      $(".chip .money").html(chip + '积分')
      $(".chip").css("display", "block");
      renderOption();
    }else {

      $('.user' + betUser.userId + ' .money').html('下注：'+ chip +'积分').css("display", "block")
    }

  });

  socket.on('deal', function(data) {

    var loading = weui.loading("发牌中，请稍等...");
    renderUserInfo(data.room.userList)

    setTimeout(function() {

      loading.hide()
      setTimeout(function() {
        $(".poker__out").addClass('active');
      }, 3000);

    }, 3000)
  });

  socket.on('compare', function(data) {

    console.log(data);
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