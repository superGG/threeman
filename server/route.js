/**
 * Created by Ninico on 29/08/2017.
 */

const fs = require('fs');
const path = require('path');

const config = {
  '/': ctx => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream(path.join(__dirname, '../pages/login.html'));
  }
};

const login = ctx => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream(path.join(__dirname, '../pages/login.html'));
};

const getConfig = pageName => {

  if(config[pageName]) {

    return config[pageName]
  }

  return ctx => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream(path.join(__dirname, '../pages/' + pageName + '.html'));
  }
};

exports.getConfig = getConfig;

