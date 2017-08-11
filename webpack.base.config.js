const path = require('path')
const _ = require('lodash')

module.exports = {
	output: {
		path: path.join(__dirname, 'public'),
		filename: '[name].js',
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				include: __dirname,
			},
			{
				test: /\.css$/,
				loader: "style-loader!css-loader"
			},
			{
				test: /\.less$/,
				loader: 'style-loader!css-loader!less-loader',
			},
			{
				test: /\.tpl?$/,
				loader: 'raw-loader'
			},
			{
				test: p => _.endsWith(p, 'schemas.json'),
				loader : 'reql-schema-loader'
			},
			{
				test: p => _.endsWith(p, '.json') && ! _.endsWith(p, 'schemas.json'),
				loader: 'json-loader'
			},
			{
				test: /\.(jpg|png)$/,
				loader: 'url-loader?limit=20000'
			},
		],
	},
};
