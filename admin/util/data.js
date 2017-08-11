import isPlainObject from 'lodash/isPlainObject'

/**
 * 将数据还原回正常的object
 * @return {{}}
 */
const mergeData = (data) => {
	let merge = {}
	Object.keys(data)
		.forEach(key => {
			let itemValue = data[key]
			let keys = key.split('.')
			let tmp = merge
			keys.forEach((column, index) => {
				if (keys.length - 1 == index) {
					tmp[column] = itemValue
					return
				}
				if (! tmp.hasOwnProperty(column)) {
					tmp[column] = {}
				}
				tmp = tmp[column]
			})
		})
	return merge
}

/**
 * 将数据键值展开
 */
const spreadData = (data, parentKey) => {
	let spread = {}
	Object.keys(data).forEach(key => {
		let fullKey = parentKey == undefined ? key : parentKey + '.' + key
		if (isPlainObject(data[key])) {
			let childSpread = spreadData(data[key], fullKey)
			spread = {...spread, ...childSpread}
		} else {
			spread[fullKey] = data[key]
		}
	})
	return spread
}

export {mergeData, spreadData}