$(function() {

  $("#vcode").click(function() {

    var tel = $("input[name=tel]").val();

    if(!tel) {
      weui.topTips("请输入电话号码！")
      return;
    }

    $.ajax({
      method: "POST",
      url: serverUrl + 'user/sendSMSCode?phone=' + tel
    }).success(function(data) {

      if(errorServer(data)) {

        return
      }

      var vcodeBtn = $("#vcode");


      var i = 60;
      var timer = setInterval(function() {

        if(i == 0) {

          vcodeBtn.html("获取验证码")
          vcodeBtn.attr("disabled", false)
          i = 60;
          clearInterval(timer);
          return;
        };

        vcodeBtn.attr("disabled", true)

        vcodeBtn.html(i + "s");
        i--;
      }, 1000)
    })
  });

  $("#register").click(function() {

    var tel = $("input[name=tel]").val();
    var password = $("input[name=password]").val();
    var code = $("input[name=code]").val();
    var agree = $("input[name=agree]")[0].checked;


    if(
      checkRequired(tel, "电话号码")
      &&
        checkRequired(password, "密码")
      &&
        checkRequired(code, "验证码")
      &&
        checkAgree(agree)
    ){


      $.ajax({
        method: "POST",
        url: serverUrl + "user/register?code=" + code,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
          "data" :{
            "phone" : tel,
            "password" : password
          }
        })
      }).success(function(data) {

        if(errorServer(data)) {

          return false
        }

        weui.toast("注册成功，请您及时登录", {
          duration: 3000,
          callback: function() {
            window.location.href = '/'
          }
        })
      })
    }
  })

});