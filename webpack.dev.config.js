const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');
const merge = require('lodash/merge');

const config = merge({}, baseConfig);

config.devtool = 'cheap-module-eval-source-map';
config.entry = {
  admin : ['webpack-hot-middleware/client?reload=true', './admin/index.js']
};
config.output.chunkFilename = '[id].chunk.js';
config.output.publicPath = '/';
config.plugins = [
  // new webpack.optimize.CommonsChunkPlugin('share.js'),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  // new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env.RUNTIME': '"web"',
    'process.env.NODE_ENV': '"development"',
  }),
];

module.exports = config;
