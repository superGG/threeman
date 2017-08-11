const crypto = require('crypto')

const params = { total_amount: '0.01',
	buyer_id: '2088802580504958',
	trade_no: '2017051821001004950223144690',
	notify_time: '2017-05-18 18:32:26',
	subject: 'OE加速器套餐',
	sign_type: 'RSA2',
	buyer_logon_id: '553***@qq.com',
	auth_app_id: '2017042206893746',
	charset: 'utf-8',
	notify_type: 'trade_status_sync',
	invoice_amount: '0.01',
	out_trade_no: '71',
	trade_status: 'TRADE_SUCCESS',
	gmt_payment: '2017-05-18 18:32:26',
	version: '1.0',
	point_amount: '0.00',
	sign: 'I+r9LMYr816HfZ/WkuzPA46yF83noO4V7SsoCWEKUWwo8RfIb6CZTZlcKYdCAu2MpOZO9ekHvk15xkr1n3nwavR1KUP8h9YOjScueAXMgMvPDn7Z3i7DgMEmoiZs2inAz2I2WcuTwWi+wlrTKQPd2yRg7rFUlbbCnrEcAtxMaJygy4TJU/Dm3gTKSmNQt7z1+T+Iy57YlbAClHDNxz+tI7itDsFt0uHH+4+uNWOpH9y5p1kvNI4tlWnBC10Cz+MfRrAhxAHxT5LAMtG9i4bH+Yi0SXOteosgn6k9brbxpdBlNgrqnbBOq0gkNR4dJFvedDckIHQ2hVSXNdlpfPsxEQ==',
	gmt_create: '2017-05-18 18:32:25',
	buyer_pay_amount: '0.01',
	receipt_amount: '0.01',
	fund_bill_list: '[{"amount":"0.01","fundChannel":"ALIPAYACCOUNT"}]',
	app_id: '2017042206893746',
	seller_id: '2088122547601727',
	notify_id: 'd8fc3302691edcfcb61547d38ada178nby',
	seller_email: '15813895993' }

console.log(Object.keys(params).map(key => `${key}=${params[key]}`).join('&'))

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5vLajHsm8G5v/AtKEDWIspPAibu6wdOqG4iIKHVU/4App7C1jREUkjRN+1Lc1vr8XNfzcJG/VGRzF8SzxD//k80NCkQ51wKgnwAUXkt/jATYTFo2krsG4rzcfROj3n02xIguUnO6CE3wH/HN75laSMqyYC4uQGb15pcNvtfjjwPUNZi9Z0i/Fgc/DdNDLQn67S3YF9amHs6ovu1rwEDcrdVRcBF+8V594IFS04yCh8kBQ6ix5k64NMHQjDfJHjsaXZrcrCv3EZpaAQn8NXgAR3+BAabtGKInNT/E1Zzx0qA2NxZHPF1BtiKKGFsJiFy2VTnvJIo/h6njcjdU2mbM7wIDAQAB
-----END PUBLIC KEY-----`

test('get verify', () => {
	console.log(verify(params, params.sign))
})

function verify(params, signMsg) {
	const content = Object.keys(params)
		.filter(key => key != 'sign' && key != 'sign_type')
		.sort()
		.map(key => `${key}=${params[key]}`)
		.join('&')
	const verifyer = crypto.createVerify('RSA-SHA256')
	verifyer.update(content)
	return verifyer.verify(publicKey, signMsg, 'base64')
}