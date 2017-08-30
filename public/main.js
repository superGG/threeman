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
  var paramsArr = window.location.href.split("?")[1].split('&');
  var roomId = paramsArr[0].split("=")[1];
  var role = paramsArr[1].split('=')[1];
  var userId = localStorage.getItem('userId');
  var Msgloading = '', timer = '';
  var user = ""
  var start = true;

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

      var pokerSrc = item.number + "_" + Math.abs(item.color - 4) + ".png";
      pokerStr = pokerStr + '<div class="poker__out"><div class="poker__bg"></div>' +
        '<div class="poker__a" style="background-image:url(/poker/' + pokerSrc +');"></div></div>';
    });


    return pokerStr;
  };

  /**
   * 渲染用户信息
   * @param userList
   */
  var renderUserInfo = function(room) {

    var userList = room.userList;

    if(userList[userId].result) {
      renderOption(5, userList)
    }else if(room.allReady) {

      if(userList[userId].bet) {
        renderOption()
      }else {
        renderOption(3)
      }
    }else if(userList[userId].ready) {
      renderOption(2)
    }else {
      renderOption(1)
    }
    renderMyinfo(userList[userId]);
    delete userList[userId];

    var i = 1;
    var userStr = "";
    for(var p in userList) {

      var readyStr = userList[p].ready  ? '准备中' : '未准备';
      var betStr = userList[p].bet ? '<span class="money" style="display:block;">下注：' + userList[p].bet +'积分</span>' :
        '<span class="money">下注：积分</span>';

        userStr = userStr + '<div class="player '+ siteNote[i]+ ' user' + userList[p].userId +'"><div class="userInfo">'
        + '<div class="avatar"><img src="'+ baseUrl + userList[p].image +'" alt=""></div>'
        + '<span class="nick">'+ userList[p].name +'</span><span class="count">积分: ' + userList[p].interal +'</span></div>'
        + '<div class="pokerBg">' + renderPoker(userList[p].poker) + '</div>' +
        '<span class="ready">' + readyStr +'</span> ' + betStr +'</div>'

      i ++;
    }

    i = 0;
    $(".other").html(userStr);
  };

  /**
   * 渲染自己的信息
   * @param myInfo
   */
  var renderMyinfo = function(myInfo) {

    $(".my .userInfo .avatar img").attr("src", baseUrl + myInfo.image);
    $(".my .userInfo .nick").html(myInfo.name);
    $(".my .userInfo .count").html(myInfo.interal);
    $(".my .poker").html(renderPoker(myInfo.poker));

    $('.my .chip').css('display', 'none');
    if(myInfo.bet) {
      $('.my .chip').css('display', 'block');
      $('.chip .money').html(myInfo.bet + '积分');
    }
  };

   $('.option').on("click", "li", function(e) {

     var id = e.target.id;
     var type = e.target.type;


     if(type === 'chip') {

       var val = e.target.innerHTML;
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

     if(id === 'nextRound') {

       socket.emit('endGame', {
         roomId: roomId
       });
     }

     if(id === 'waitRound') {

       renderOption()
     }

     if(id === 'leaveGame') {

       socket.emit('leaveRoom',  {
         roomId: roomId,
         user: user
       })
     }

     if(id === 'closeGame') {

       Msgloading = weui.loading("请求中...")
       socket.emit("closeRoom", {
         roomId: roomId
       })
     }

   });


  $('#close-result').click(function() {
    $(".result_alert").css('display', "none");
    start = true;
    clearTimeout(timer);
    if(role == 1) {
      renderOption(4)
    }else {
      renderOption(6)
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

  var renderResult = function(userArray) {

    var str = '';
    userArray.forEach(function(item, index) {

      var pokerHtml = '';
      item.poker.forEach(function(item, index) {
        pokerHtml = pokerHtml + '<img src="/poker/'+ item.number + '_' + Math.abs(item.color - 4)+'.png" alt="">';
      });

      var val = item.result.rank === 5 ? "三公" : item.result.number + "点";


      str = str + '<div class="item"> ' +
        '<span class="ranking">'+ (index + 1) +'</span>' +
        ' <div class="poker"> ' + pokerHtml +
        '</div> <span class="type">' + val +'</span> ' +
        '<span class="name">' + item.name+'</span> ' +
        '<div class="chip"> <div class="deal">' + item.bet+' </div>' +
        ' <div class="add">' + item.result.count +' </div> </div> </div>'
    });

    $(".result_alert").css("display", "block").find('.content').html(str)

    timer = takeTime(20, function() {

      if(!start){
        if(role == 1) {
          renderOption(4)
        }else {
          renderOption(6)
        }
      }
      $('.result_alert').css('display', "none");

     
    })

    var i = 0;
    var secTimer = setInterval(function() {
      if(i >= 20) {
        clearInterval(secTimer);
        i = 0
      }
      $('.result_alert .subtitle .count').html(20 - i)
      i++
    }, 1000)

    return str;
  };


  /**
   * 渲染操作区
   * 1 ready
   * 2 wait order ready
   * 3 deal
   * 4 nextRound
   * 5 result
   * 6 waitNextRound
   * default none
   * @param optionFlag
   */
  var renderOption = function(optionFlag, userList) {

    $('.result_alert').css("display", "none");
    $('.option').css("display", "none");

    var userArray = [];

    var leaveOption = role == 1 ? "closeGame": "leaveGame";

    switch(optionFlag) {
      case 1:
        $('.option').css('display', 'block');
        var optionStr = '<h3>准备好了，就可以开始游戏啦！</h3><li id="ready">准备</li><li id="' + leaveOption +'">离开</li>';
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
      case 4:
        $('.option').css('display', 'block');
        $('.option ul').html('<h3>是否开始下一轮</h3><li id="nextRound">开始</li><li id="closeGame">关闭游戏</li>');
        return;
      case 5:
        $(".poker__out").addClass('active');
        for(var p in userList) {
          userArray[userList[p].result.sort] = userList[p];
        }
        renderResult(userArray);
        return;
      case 6:
        $('.option').css('display', 'block');
        $('.option ul').html('<h3>是否开始下一轮</h3><li id="waitRound">等待下一轮</li><li id="leaveGame">离开</li>');
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
    if(errorServer(data)) {
      return false
    }

    user = data.room.userList[userId];
    chip = data.room.minChip;
    renderUserInfo(data.room);
  });

  socket.on("readyGame", function(data) {

    if(errorServer(data)) {
      return false
    }

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

    if(errorServer(data)) {
      return;
    }

    var betUser = data.betUser;
    var chip = data.money;

    if(user.userId === betUser.userId) {
      $(".chip .money").html(chip + '积分')
      $(".my .chip").css("display", "block");
      renderOption();
    }else {

      $('.user' + betUser.userId + ' .money').html('下注：'+ chip +'积分').css("display", "block")
    }

  });

  socket.on('deal', function(data) {

    if(errorServer(data)) {
      return false
    }

    var loading = weui.loading("发牌中，请稍等...");
    renderUserInfo(data.room)

    setTimeout(function() {

      loading.hide()
      setTimeout(function() {
        $(".poker__out").addClass('active');
      }, 3000);

    }, 3000)
  });

  socket.on('compare', function(data) {
    if(errorServer(data)) {
      return false
    }
    
    start = false;
    var userArray = data.userArray;

    renderResult(userArray)
    renderUserInfo(data.room)
  });

  socket.on('endGame', function(data) {

    if(errorServer(data)) {
      return false
    }

    start = true;

    clearTimeout(timer)
    renderUserInfo(data.room);
  });


  socket.on("leaveRoom", function(data) {

    if(errorServer(data)) {
      return false
    }

    if(data.leaveUser.userId == user.userId) {
      weui.toast("操作成功", {
        duration: 3000,
        callback: function(){ location.href = '/userInfo' }
      })
    }

    $('.user' + data.leaveUser.userId).remove()

  });

  socket.on("closeRoom", function(data) {

    if(errorServer(data)) {
      return false
    }

    if(role == 1) {
      Msgloading.hide();
    }

    weui.topTips(data.message, {
      duration: 3000,
      callback: function(){ location.href = '/userInfo' }
    })
  });



  var width = document.documentElement.clientWidth;
  var height =  document.documentElement.clientHeight;
  if( width < height ){
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