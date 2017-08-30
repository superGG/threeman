$(function() {

  var avatar = localStorage.getItem('avatar');
  if(avatar) {
    location.href = '/userInfo'
  }

  var checkAvatar = function(val) {

    if(!val) {

      weui.topTips("请先上传头像");
      return false
    }

    return true
  }

  var userAvatarUrl = '';
  var setErr = function() {

    $(".weui-uploader__input-box").css("display", "block");
    $(".weui-uploader__file").remove()
  };

  $("#uploaderInput").change(function() {

    var file = $("#uploaderInput")[0].files[0];
    var formData = new FormData();
    formData.append("userAvatar", file);

    $("#uploaderFiles").append('<li class="weui-uploader__file weui-uploader__file_status"> <div class="weui-uploader__file-content">0%</div> </li>')
    $(".weui-uploader__input-box").css("display", "none");

    $.ajax({
      type: 'POST',
      data: formData,
      url: serverUrl + "upload",
      processData : false,
      contentType:false,
      xhr:xhrOnProgress(function(e){
        var percent=e.loaded / e.total;//计算百分比

        $(".weui-uploader__file-content").html(parseInt(percent * 100) + "%")
      })

    }).success(function(data) {

      if(errorServer(data)) {
        setErr()
        return false
      }

      var url = data.files.userAvatar;
      userAvatarUrl = url;
      $('.weui-uploader__file').removeClass("weui-uploader__file_status").css("background-image", "url("+ baseUrl + url +")");
      $('.weui-uploader__file-content').css("display", "none");

    })
  });

  $("#update").click(function() {

    var nick = $("#nick").val();
    var userId = localStorage.getItem("userId");
    if(
      checkAvatar(userAvatarUrl)
      &&
        checkRequired(nick, "昵称")
    ) {

      $.ajax({
        method: "POST",
        url: serverUrl + "user/update",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
          "data" : {
            "userId" : userId,
            "name" : nick, //更改用户头像时为  "image" : "***"
            image: userAvatarUrl
          }
        })
      }).success(function(data) {

        if(errorServer(data)) {
          setErr()
          return false
        }

        weui.toast("更新成功！", {
          duration: 3000,
          callback: function() {
            window.location.href = '/userInfo'
          }
        })
      })
    }
  })
})