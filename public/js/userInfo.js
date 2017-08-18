$(function() {

  var user = "";
  var userId = localStorage.getItem("userId");
  $.ajax({
    url: serverUrl + "user/getUserInfoById?userId=" + userId,
    method: "POST"
  }).success(function(data) {

    $(".user-avatar .avatar").css("background", "url(" + baseUrl + data.result.image + ")")
    $(".user-avatar .user-name").html(data.result.name);
    $(".user-avatar .count span").html(data.result.interal);
    user = data.result;
    localStorage.setItem("name", data.result.name);
    localStorage.setItem("avatar", data.result.image)
  })
});