app api
---

接口规约：接口前面需要加上base域，在本文档中接口url前均需要加上/api。接口参数分两种，一种是param，一种是data，其中param可以通过get后的参数或者post中body的param字段传递，data通过post中body进行传递。在post body中传递的参数通过json格式发送。

* 验证码发送

url : /user/sendSMSCode

param : phone(手机号码)

* 用户注册

url : /user/register

param : code(验证码)

data : phone(手机号码) password(密码，32位小写md5)

* 用户登录

url : /user/login

param : phone(手机号码) password(密码，32位小写md5)

* 购买

url : /order/buy

param : packageId(套餐id)

* 获取用户连接节点

url : /user/node

* 获取地区列表

url : /place/list

* 更换节点

url : /nodeUser/change

param : placeId(节点id)

* 套餐列表

url : /package/list

* 密码重置

url : /user/resetPassword

param : code(验证码) phone(用户手机) password(新密码md5 32位小写)

* 购买记录

url : /order/record

* 问答列表

url : /question/list

* 获取过期时间

url : /balance

* 支付宝订单签名

url : /pay/alipay/sign

param : orderId(订单id)

* 微信订单签名

url : /pay/wechat/sign

param : orderId(订单id)