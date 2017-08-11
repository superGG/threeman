import axios from 'axios'

import config from '../config'

const fetch = (url, {body = {}, data, param = {}} = {}, cb) => {
	let token = localStorage.token
	
	body.param = param
	if (token) {
		body.param.token = token
	}
	if (data) {
		body.data = data
	}
	axios.post(getUrl(url), body).then(response => {
		console.log('response', response)
		if (response.status == '200') {
			if(response.data.code === 101){
				// alert('')
				window.location.href = '/admin#login'
			}
			cb(response.data.result)
		}
	}).catch(err => {
		console.error(err)
		if (err.response.status == 401) {
			window.location.href = '/admin#login'
		}
		cb(null, err)
	})
}

const fetchCount = (url, {body = {}, param = {}}, cb) => {
	let token = localStorage.token
	
	body.param = param
	if (token) {
		body.param.token = token
	}
	axios.post(getUrl(url), body).then(response => {
		if (response.status == '200') {
			cb(response.data.result)
		}
	}).catch(err => {
		cb(null, err)
	})
}

const getUrl = (url) => {
	return config.server + config.reqlApi + url
}

const setToken = newToken => {
	let token = newToken
	localStorage.token = token
}

export {fetchCount, setToken}
export default fetch