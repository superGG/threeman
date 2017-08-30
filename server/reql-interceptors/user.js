const jwt = require('jsonwebtoken')
const axios = require('axios')
const querystring = require('querystring')
const crypto = require('crypto')
const config = require('../config.json')
const tool = require('./tool')
const {HttpError} = require('reql-koa')
const UserType = require('../bean/user-type')
const adminInfos = process.env.NODE_ENV == 'production'
	? require('../admin-infos.json').prod
	: require('../admin-infos.json').dev

const md5 = text => crypto.createHash('md5').update(text).digest('hex')

const secretToken = '123456'
const salt = '123456'

const addSalt = text => md5(salt + text)

/**
 * 发送短信
 * @param param
 * @param cache
 */
exports.sendSMSCode = async function ({param, cache,session}) {
    let code = null;
    const {phone, x} = param;
    if (phone == null) return new HttpError('手机号不能为空', 103);
	let user = await session.query(`query {user(phone=$phone):{*}}`,{phone})
	if(user!=null) throw new HttpError('该手机号已被注册', 103);

    let tmpPhone  = await cache.get(`${phone}-sms-phone`);
    if (tmpPhone!=null) return new HttpError('操作过于频繁，请稍后再试', 103);

    let response = null
    if ((x != null && x == md5(phone + 'code')) || (process.env.NODE_ENV === 'production')) {  //生产环境
    code = new String(Math.random()).substring(2, 8)
    const sms = `【小游戏】您的验证码是${code}，30分钟过期`
        response = await axios.post('http://api.smsbao.com/sms', querystring.stringify({
    	u: 'TOFF2017',
    	p: md5('35889374'),
    	m: phone,
    	c: sms
    }))
    } else {  //开发测试环境
    	code = '123456'
        response = {data: 0};
    }
    if (response == null || response.data != '0') {
        return new HttpError('验证码发送失败', 103);
    } else {
       await cache.set(`${phone}-sms-code`, code, {expire : 60 * 30})
       await cache.set(`${phone}-sms-phone`, phone, {expire : 60 * 1})
    }
}

/**
 * 注册
 * @param param
 * @param data
 * @param session
 * @param cache
 */
exports.register = async function ({param, data, session, cache}) {
	// const {code} = param
	const {phone} = data
	// const tmpCode = await cache.get(`${phone}-sms-code`)
	// if (tmpCode != code) {
	// 	return new HttpError('验证码错误', 103)
	// }
	// await cache.remove(`${phone}-sms-code`)
	const count = await session.query('count [user(phone = $phone) : {userId}]', {phone : data.phone})
	if (count > 0) {
		return new HttpError('号码已经被注册', 102)
	}
	data.password = addSalt(data.password)
    //记录用户注册时间
	data.registerTime = new Date();
	data.name = phone
	data.image = '/default_image.png'
	const user = await session.addUser(data)
	return {
		userId : user.userId
	}
}

/**
 * 登录
 * @param param
 * @param session
 */
exports.login = async function ({param, session}) {
	param.password = addSalt(param.password)
	const user = await session.query(`query {user(phone = $phone && password = $password) : {userId, phone,name,image}}`, param)
	if (user !== null) {
		const token = jwt.sign({
			//24小时过期，暂时设置为1周过期
			exp : Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
			data: {
				userId: user.userId,
				type : UserType.User
			}
		}, secretToken)
        //记录用户最近登录时间
        user.lastLoginTime = new Date();
        await user.save();
		return {
			user,
			token : token
		}
	} else {
		return new HttpError('用户密码错误', 100)
	}
}

/**
 * 匹配token
 * @param param
 * @param req
 */
exports.checkToken = async function ({param, req}) {
	const token = param.token || req.body.token
	if (token != null) {
		let decoded = null
		try {
			decoded = jwt.verify(token, secretToken)
		} catch (err) {
			return new HttpError('登陆过期', 101)
		}
		if (decoded.data.type == UserType.User) {
			//注入login id
			param.loginId = decoded.data.userId
		}
	}
}

/**
 * 修改密码
 * @param param
 * @param session
 * @param cache
 */
exports.resetPassword = async function ({param, session, cache}) {
	const {phone, code, password} = param
	const tmpCode = await cache.get(`${phone}-sms-code`)
	if (code != tmpCode) {
		return new HttpError('验证码错误', 103)
	}
	const user = await session.queryUserByPhone(phone)
	if (user == null) {
		return new HttpError('用户不存在', 104)
	}
	user.password = addSalt(password)
	await user.save()
}

/**
 * 充值积分
 * @param data
 */
exports.rechargeInteral = async ({data,session}) => {
	if (data.interal == 0) throw new Error('操作有误')
	let user = await session.query(`query {user(userId=$userId):{userId,interal}}`,{userId:data.userId})
    user.interal += Number(data.interal);
	await user.save();
	await session.execute(`add {record}`,{interal:data.interal,user:{userId:data.userId},way:"充值"})
}

/**
 * 管理员登录
 * @param param
 */
exports.adminLogin = ({param}) => {
	const admin = adminInfos.filter(admin => admin.phone == param.phone && md5(admin.password) == param.password)[0]
	if (admin != null) {
		const token = jwt.sign({
			//一天过期
			// (60 * 60 * 24 * 7)
			exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
			data: {
				type : UserType.Admin
			}
		}, secretToken)
		return {
			token
		}
	} else {
		throw new Error('账号或密码错误')
	}
}
