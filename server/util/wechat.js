const crypto = require('crypto')
const uuidV4 = require('uuid/v4')
const axios = require('axios')
const xml2js = require('xml2js')

const md5 = text => crypto.createHash('md5').update(text).digest('hex')

const XmlParser = () => {
	const parser = new xml2js.Parser()
	return xml => {
		return new Promise((resolve, reject) => {
			parser.parseString(xml, (err, result) => {
				if (err) return reject(err)
				resolve(result)
			})
		})
	}
}

/**
 * 微信支付
 */
class WechatPay {
	/**
	 *
	 * @param appId  AppID
	 * @param mchId 商家id
	 * @param signType  签名类型，默认为md5
	 * @param notifyUrl  回调地址
	 * @param tradeType  交易类型，默认为APP
	 * @param appSecret  应用密钥
	 */
	constructor({appId, mchId, signType, notifyUrl, tradeType, key}) {
		this.appId = appId
		this.mchId = mchId
		this.signType = signType || WechatPay.SIGN_TYPE.MD5
		this.tradeType = tradeType || WechatPay.TRADE_TYPE.APP
		this.notifyUrl = notifyUrl
		this.key = key
		this.xmlBuilder = new xml2js.Builder()
		this.xmlParser = XmlParser()
	}

	/**
	 *
	 * @param orderId  订单id
	 * @param clientIp  客户端ip
	 * @param totalFee  价格，分钱
	 * @param body  商品描述
	 * @return {Promise.<*>}
	 */
	async sign({orderId, clientIp, totalFee, body}) {
		const params = {
			appid : this.appId,
			mch_id : this.mchId,
			body,
			nonce_str : uuidV4().substring(4),
			sign_type : this.signType,
			out_trade_no : orderId,
			total_fee : totalFee,
			spbill_create_ip : clientIp,
			notify_url : this.notifyUrl,
			trade_type : this.tradeType
		}
		//第一次签名
		const content = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&') + `&key=${this.key}`
		params.sign = md5(content).toUpperCase()
		const xml = '<xml>' + Object.keys(params).sort().map(key => `<${key}>${params[key]}</${key}>`).join('') + '</xml>'
		//统一下单
		const resultXml = await axios.post(WechatPay.URL, xml, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
		const xmlObject = await this.xmlParser(resultXml.data)
		const result = {}
		Object.keys(xmlObject.xml).forEach(key => result[key] = xmlObject.xml[key][0])
		//第二次签名
		const resultParams = {
			appid : this.appId,
			noncestr : uuidV4().substring(4),
			package : 'Sign=WXPay',
			partnerid : this.mchId,
			prepayid : result.prepay_id,
			timestamp : new Date().getTime().toString().substr(0,10)
		}
		const resultContent = Object.keys(resultParams).sort().map(key => `${key}=${resultParams[key]}`).join('&') + `&key=${this.key}`
		resultParams.sign = md5(resultContent).toUpperCase()
		return resultParams
	}

	/**
	 * 签名校验
	 * @param params
	 */
	verify(params) {
		const content = Object.keys(params).filter(key => key != 'sign').map(key => `${key}=${params[key]}`).join('&') + `&key=${this.key}`
		return md5(content).toUpperCase() == params.sign
	}
}

WechatPay.SIGN_TYPE = {
	MD5 : 'MD5'
}

WechatPay.TRADE_TYPE = {
	APP : 'APP'
}

WechatPay.RETURN_CODE = {
	SUCCESS : 'SUCCESS',
	FAIL : 'FAIL'
}

WechatPay.URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder'

module.exports = WechatPay