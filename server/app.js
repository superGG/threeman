const path = require('path')
const fs = require('fs')

const Koa = require('koa')
//路由中间件
const route = require('koa-route')
//日志中间件
const logger = require('koa-logger')
//body解析中间件
const bodyParser = require('koa-bodyparser')
//静态资源中间件
const koaStatic = require('koa-static')
//跨越请求中间件
const cors = require('kcors')
//reql api中间件
const reql = require('reql-koa')

const YuanData = require('yuan-data')

const socket = require('./socket/socket')

const app = new Koa()

const start = async() => {
    const config = await configAsync(__server + '/config.json')
    app.use(logger())
    app.use(cors())
    app.use(koaStatic(path.resolve(__dirname, '../public'), {maxage: 60 * 24}))
    app.use(route.get('/admin*', async ctx => {
        ctx.type = 'html';
        ctx.body = fs.createReadStream(path.join(__dirname, '../admin/index.html'))
    }));
    //测试socket通信
    app.use(route.get('/socketTest', async ctx => {
        ctx.type = 'html';
        ctx.body = fs.createReadStream(path.join(__dirname, 'socketTest.html'))
    }));

    app.use(bodyParser({
        jsonLimit: '5mb', // 控制body的parse转换大小 default 1mb
        formLimit: '4096mb'  //  控制你post的大小  default 56kb

    }))

    let yuanData = YuanData.create(config.reql)
    await yuanData.connect()

    app.use(await reql(yuanData, config['reql-api']))

    //建立socket通信
    var server = require('http').createServer(app.callback())
    var io = require('socket.io').listen(server)
    await socket.start(io.sockets,yuanData)

    console.info(`server listen port on ${config.server.port}`)
    // app.listen(config.server.port)
    server.listen(config.server.port)
}

module.exports = start