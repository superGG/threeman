if (process.env.NODE_ENV === 'production') {
	module.exports = {
		server: 'http://open-end.cn:8080',
		reqlApi: '/api'
	}
} else {
	module.exports = {
		server: 'http://127.0.0.1:8080',
		reqlApi: '/api'
	}
}