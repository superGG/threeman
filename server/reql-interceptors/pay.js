const path = require('path')
const fs = require('fs')
const ipaddr = require('ipaddr.js')
const {HttpError} = require('reql-koa')
const Alipay = require('../util/alipay')
const Wechat = require('../util/wechat')
const {xmlParser} = require('../util/xml')
// const {addNodeUser} = require('../util/node')

const config = configSync(path.resolve(__dirname, '../pay.config.json'))

const alipay = new Alipay({
	privateKey : fs.readFileSync(config.alipay.primaryCertFile, 'utf-8'),
	publicKey : fs.readFileSync(config.alipay.publicCertFile, 'utf-8'),
	pid : config.alipay.PID,
	email : null,
	appId : config.alipay.APPID,
	notifyUrl : config.alipay.notifyUrl
})

const wechat = new Wechat({
	appId : config.wechat.appId,
	mchId : config.wechat.mchId,
	notifyUrl : config.wechat.notifyUrl,
	key : config.wechat.key
})

exports.alipaySign = async ({param, session}) => {
	const {orderId} = param
	const vpnOrder = await session.queryVpnOrderById(orderId)
	const sign = alipay.sign({
		orderId,
		money : process.env.NODE_ENV != 'production' ? 0.01 : vpnOrder.price,
		subject : 'OE加速器套餐'
	})
	return {sign}
}

exports.wechatSign = async({req, param, session}) => {
	const {orderId} = param
	const vpnOrder = await session.queryVpnOrderById(orderId)
	const result = await wechat.sign({
		orderId,
		totalFee : process.env.NODE_ENV != 'production' ? 1 : vpnOrder.price * 100,
		body : 'OE加速器套餐',
		clientIp : ipaddr.process(req.ip).octets.join('.')
	})
	return result
}

exports.alipayNotify = async ({req, session}) => {
	const {sign, sign_type, trade_status} = req.body
	if (trade_status == 'TRADE_CLOSED' || trade_status == 'TRADE_FINISHED') {
		return new HttpError('error')
	}
	if (alipay.verify(req.body, sign) == true) {
		//订单号
		await paySuccess(req.body.out_trade_no, session)
		return 'success'
	} else {
		//签名验证失败
		return new HttpError('签名校验失败')
	}
}

exports.wechatNotify = async ({req, ctx, param, session}) => {
	const xml = await receive(ctx)
	const xmlResult = await xmlParser(xml)
	const result = {}
	Object.keys(xmlResult.xml).forEach(key => result[key] = xmlResult.xml[key][0])
	if (result.result_code == 'SUCCESS') {
		if (wechat.verify(result)) {
			await paySuccess(result.out_trade_no, session)
			return `<xml><return_code>SUCCESS</return_code></xml>`
		} else {
			return new HttpError(`支付失败：签名校验失败`)
		}
	} else {
		return new HttpError(`支付失败：${result.err_code_des}`)
	}
}

const receive = function (ctx) {
	return new Promise((resolve, reject) => {
		let buf = ''
		ctx.req.setEncoding('utf8')
		ctx.req.on('data', chunk => {
			buf += chunk
		})
		ctx.req.on('end', () => resolve(buf))
	})
}

const paySuccess = async (orderId, session) => {
	const order = await session.query(`query {vpnOrder(orderId = $orderId) : {*, package : {day}, user : {userId, phone}}}`, {orderId})
	const user = order.user
	order.status = '已经支付'
    order.payTime = new Date();
	const balance = await session.query(`query {balance : {*, user(userId = $userId)}}`, {userId : user.userId})
	if (balance.expire < new Date()) {
		balance.expire = new Date()
	}
	balance.expire.setDate(balance.expire.getDate() + order.package.day)
	await balance.save()
	await order.save()
}