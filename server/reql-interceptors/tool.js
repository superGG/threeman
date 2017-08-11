const {HttpError} = require('reql-koa')
const _ = require('lodash')
var captchapng = require('captchapng');

exports.check = async ({api, param, data, session}) => {
	const getValue = GetValue(data, param, session)
	if (api.data) {
		try {
			data = await checkDataOrParam(api.data, data, getValue)
		} catch (err) {
			if (err.code == 400) {
				return new HttpError(err.message, 400)
			}
			throw err
		}
	}
	if (api.param) {
		try {
			param = await checkDataOrParam(api.param, param, getValue)
		} catch (err) {
			if (err.code == 400) {
				return new HttpError(err.message, 400)
			}
			throw err
		}
	}
}

const checkDataOrParam = async (rules, target, getValue) => {
	if (_.isPlainObject(rules)) {
		const result = {}
		for (const key in rules) {
			let rule = rules[key]
			//递归校验
			if (target.hasOwnProperty(key) && (_.isObject(target[key]) || _.isArray(target[key]))) {
				result[key] = await checkDataOrParam(rule, target[key], getValue)
			}
			//isRequired补齐
			if (_.isBoolean(rule)) {
				rule = {isRequired : rule}
			}
			//string value补齐
			if (_.isString(rule)) {
				rule = {value : rule}
			}
			//number value补齐
			if (_.isNumber(rule)) {
				rule = {value : rule}
			}
			//设置默认值
			if (rule.hasOwnProperty('default') && ! target.hasOwnProperty('default')) {
				result[key] = await getValue(rule.default)
			}
			//设置值
			if (rule.hasOwnProperty('value')) {
				result[key] = await getValue(rule.value)
			}
		}
		return result
	} else if (_.isArray(rules)) {
		return await Promise.all(target.map(child => checkDataOrParam(rules[0], child, target, param, session)))
	} else {
		const err = new Error('校验规则比较是object或者array')
		err.code = 400
		throw err
	}
}

const GetValue = (data, param, session) => {
	return target => {
		if (_.isString(target)) {
			if (_.startsWith(target, '$')) {
				//从param获取值
				return param[target.substring(1)]
			}
			return target
		}
	}
}

/**
 * 生成图片验证码
 * @param res
 */
exports.getImgVerifyCode = (res) => {
	var code = parseInt(Math.random()*9000+1000);
    var picture = new captchapng(80,30,code); // width,height,numeric captcha
    picture.color(255, 255, 255, 255);  // First color: background (red, green, blue, alpha)
    picture.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
    var img = picture.getBase64();
    var imgbase64 = new Buffer(img,'base64');
    res.res.writeHead(200, {
        'Content-Type': 'image/jpeg'
    });
    res.res.end(imgbase64);
}