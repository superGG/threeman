const moment = require('moment')
const crypto = require('crypto')

/**
 * 支付宝接口
 */
class Alipay {

	/**
	 *
	 * @param privateKey  私钥
	 * @param publicKey  公钥
	 * @param pid  商家id
	 * @param appId  app id
	 * @param notifyUrl  回调地址
	 */
	constructor({privateKey, publicKey, pid, appId, notifyUrl}) {
		this.primaryKey = privateKey
		this.publicKey = publicKey
		this.pid = pid
		this.appId = appId
		this.notifyUrl = notifyUrl
	}

	/**
	 * 签名
	 * @param orderId
	 * @param money
	 * @param subject
	 * @param body
	 * @param timeout
	 * @return {*|number}
	 */
	sign({orderId, money, subject, body, timeout = '30m'}) {
		const bizContent = {
			out_trade_no : orderId,
			product_code : 'QUICK_MSECURITY_PAY',
			seller_id : this.pid,
			subject,
			timeout_express : timeout,
			total_amount : money.toString()
		}
		if (body) {
			bizContent.body = body
		}
		const param = {
			app_id : this.appId,
			biz_content : JSON.stringify(bizContent),
			charset : 'utf-8',
			format : 'JSON',
			method : 'alipay.trade.app.pay',
			notify_url : this.notifyUrl,
			sign_type : 'RSA2',
			timestamp : moment().format("YYYY-MM-DD HH:mm:ss"),
			version : '1.0'
		}
		const content = Object.keys(param).sort().map(key => `${key}=${param[key]}`).join('&')
		const signer = crypto.createSign('RSA-SHA256')
		signer.update(content)
		param.sign = signer.sign(this.primaryKey, 'base64')
		return Object.keys(param).sort().map(key => `${key}=${encodeURIComponent(param[key])}`).join('&')
	}

	/**
	 * 签名校验
	 * @param params
	 * @param signMsg
	 * @return {*}
	 */
	verify(params, signMsg) {
		const content = Object.keys(params)
			.filter(key => key != 'sign' && key != 'sign_type')
			.sort()
			.map(key => `${key}=${params[key]}`)
			.join('&')
		const verifyer = crypto.createVerify('RSA-SHA256')
		verifyer.update(content)
		return verifyer.verify(this.publicKey, signMsg, 'base64')
	}

}

module.exports = Alipay