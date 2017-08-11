const webpack = require('webpack')
const baseConfig = require('./webpack.base.config')
const merge = require('lodash/object').merge

const config = merge({}, baseConfig);

config.entry = {
	admin : './admin/index.js'
};
config.output.publicPath = '/'
config.plugins = [
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false,
			drop_debugger: true,
			drop_console: true
		}
	}),
	new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: JSON.stringify('production')
		}
	})
];

module.exports = config;