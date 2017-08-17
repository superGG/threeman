$(function() {

  $("#login").click(function() {

    var tel = $("#tel").val();
    var password = $("#password").val();

    if(checkRequired(tel, "电话号码") && checkRequired(password, "密码")) {

      $.ajax({
        method: 'POST',
        contentType: "application/json; charset=utf-8",
        url: serverUrl + "user/login",
        data: JSON.stringify({
          "param" : {
            "phone" : tel,
            "password" : password
          }
        })
      }).success(function(data) {

        if(errorServer(data)) {

          return false
        }

        if(data.result) {

          localStorage.setItem("token", data.result.token);
          localStorage.setItem("userId", data.result.userId);

          weui.toast("登录成功", {
            duration: 3000,
            callback: function() {

              window.location.href = "/set_user_info"
            }
          })
        }
      })
    }
  });

});