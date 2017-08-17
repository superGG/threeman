/**
 * Created by Kellan on 2017/8/17.
 */


var connectionList = {};

exports.start = function (io) {

    io.sockets.on('connection', function (socket) {
        //客户端连接时，保存socketId和用户名
        var socketId = socket.id;
        connectionList[socketId] = {
            socket: socket
        };

        //用户进入房间事件，向其他在线用户广播其用户名
        socket.on('test', function (data) {
            socket.broadcast.emit('test', data);
            // connectionList[socketId].username = data.username;
        });
    }

}
