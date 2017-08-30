$(function() {

  var user = "";
  var userId = localStorage.getItem("userId");
  $.ajax({
    url: serverUrl + "user/getUserInfoById?userId=" + userId,
    method: "POST"
  }).success(function(data) {

    $(".user-avatar .avatar").css("background-image", "url(" + baseUrl + data.result.image + ")")
    $(".user-avatar .user-name").html(data.result.name);
    $(".user-avatar .count span").html(data.result.interal);
    user = data.result;
    localStorage.setItem("name", data.result.name);
    localStorage.setItem("avatar", data.result.image)
    localStorage.setItem("interal", data.result.interal)
  })

  $("#create").click(function() {

    if(user.interal < 50) {

      weui.alert("您的积分不足，请先充值。")
      return;
    }

    window.location.href = "/waitRoom?option=create";
  })
});