const fs = require('fs')
const _ = require('lodash')

/**
 * 同步获取配置
 * @param path
 */
let configSync = path => {
	const configTpl = fs.readFileSync(path, 'utf-8')
	return getConfig(configTpl)
}

/**
 * 异步获取配置
 * @param path
 */
let configAsync = path => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf-8', (err, data) => {
			if (err) return reject(err)
			resolve(getConfig(data))
		})
	})
}

const getConfig = configTpl => {
	const compiled = _.template(configTpl)
	const configStr = compiled({
		__project,
		__server
	})
	let config = JSON.parse(configStr)
	const NODE_ENV = process.env.NODE_ENV
	let env = 'dev'
	if (NODE_ENV == 'production') {
		env = 'prod'
	}
	setEnv(config, env)
	return config
}

const getKey = key => {
	return key.substring(key.indexOf('-') + 1)
}

const setEnv = (config, env) => {
	if (_.isPlainObject(config)) {
		Object.keys(config).forEach(key => {
			let child = config[key]
			if (key.indexOf('$dev-') == 0 && env == 'dev') {
				config[getKey(key)] = child
			} else if (key.indexOf('$prod-') == 0 && env == 'prod') {
				config[getKey(key)] = child
			} else {
				setEnv(child, env)
			}
		})
	} else if (_.isArray(config)) {
		config.forEach(child => {
			setEnv(child, env)
		})
	}
}

global.configSync = configSync
global.configAsync = configAsync