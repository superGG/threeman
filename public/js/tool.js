var baseUrl = "http://localhost:8080";
var serverUrl = baseUrl + "/api/";
var socketUrl = "http://localhost:8080";
var testUrl = "http://localhost:3000";

var checkInputVal = function(vals) {

  for(var i = 0, len = vals.length; i < len; i ++) {


  }
};

var checkVal = function(val, rules) {

  var flag = true;

  switch (rules){

    case "required":
      if(!val) {

        flag = false;
      }
      return flag;
    default:
      return flag
  }
};

var errorServer = function (data) {

  if(data.error || data.result === false) {
    weui.topTips(data.message);
    return true;
  }

  return false
};


var checkAgree = function(flag) {
  if(!flag) {

    weui.topTips("请勾选用户协议")
    return false
  }

  return true;
}


var checkRequired = function(val, message) {

  if(!val) {

    weui.topTips("请填写" + message);
    return false
  }

  return true
};


var xhrOnProgress=function(fun) {
  xhrOnProgress.onprogress = fun; //绑定监听
  //使用闭包实现监听绑
  return function() {
    //通过$.ajaxSettings.xhr();获得XMLHttpRequest对象
    var xhr = $.ajaxSettings.xhr();
    //判断监听函数是否为函数
    if (typeof xhrOnProgress.onprogress !== 'function')
      return xhr;
    //如果有监听函数并且xhr对象支持绑定时就把监听函数绑定上去
    if (xhrOnProgress.onprogress && xhr.upload) {
      xhr.upload.onprogress = xhrOnProgress.onprogress;
    }
    return xhr;
  }
}

var merge = function() {

  console.log(arguments)

  var argArr = Array.prototype.slice.call(arguments);

  return argArr.reduce(function(total, item) {

    for(var p in item) {

      total[p] = item[p]
    }

    return total;
  })


};

var takeTime = function(count, ex, cb) {

  var i = 0;

  var timer = setInterval(function() {
    ex(i);
    if(++i > count) {

      clearInterval(timer);
      cb();
    }
  }, 1000)
};