/**
 * Created by Kellan on 2017/8/17.
 */
const threeman = require('../reql-interceptors/threeman')
const axios = require('axios')
const UUID = require('node-uuid')


const poker = threeman.poker

var connectionList = {};
var roomList = {};
exports.start = async function (sockets, yuanData) {
    sockets.on('connection', function (socket) {
        //客户端连接时，保存socketId
        var socketId = socket.id;
        connectionList[socketId] = {
            socket: socket
        };

        //测试socket通信是否正常
        socket.on('test', function (data) {
            console.log(UUID.v1())
            socket.emit('test', data);
        });

        /**
         * 创建房间
         */
        socket.on('createRoom', function (data) {
            try {
                var user = data.user
                if (checkUser(user)) {
                    socket.emit('createRoom', {result: false, message: "用户已经加入别的房间"});
                    return;
                }
                var room = {};
                room.userList = {};
                room.roomId = UUID.v1(); //房间id
                room.minChip = 50;          //房间最低下注金额
                room.start = false;     //房间游戏状态
                room.userList[user.userId] = user;
                room.userList[user.userId].ready = false;   //玩家准备状态
                room.userList[user.userId].bet = 0;         //玩家下注金额
                room.poker = poker;
                socket.join(room.roomId)
                roomList[room.roomId] = room;
                var result = {result: true, room}
                console.log(user.name + "用户创建" + room.roomId + "房间")
                sockets.to(room.roomId).emit('createRoom', result);
            } catch (e) {
                console.log(e)
            }
        });

        /**
         * 加入房间
         */
        socket.on('joinRoom', function (data) {
            try {
                var {roomId, user} = data
                if (roomList[roomId] != null) {
                    if (checkUser(user)) {
                        socket.emit('joinRoom', {result: false, message: "用户已经加入别的房间"});
                        return;
                    }
                    if (roomList[roomId].start) {
                        socket.emit('joinRoom', {result: false, message: "该房间已经开始游戏"});
                        return;
                    }
                    if (user.interal < roomList[roomId].minChip) {
                        socket.emit('joinRoom', {result: false, message: "该用户的积分不够"});
                        return;
                    }
                    roomList[roomId].userList[user.userId] = user;
                    roomList[roomId].userList[user.userId].ready = false;
                    roomList[roomId].userList[user.userId].bet = 0;
                    socket.join(roomId)
                    console.log(user.name + "加入" + roomId + "房间")
                    sockets.to(roomId).emit('joinRoom', {result: true, room: roomList[roomId]});
                }
            } catch (e) {
                console.log("Join room has error")
                console.log(e)
            }
        })

        /**
         * 离开房间
         */
        socket.on('leaveRoom', function (data) {
            try {
                var {roomId, user} = data
                if (roomList[roomId] != null) {
                    if (!roomList[roomId].userList.hasOwnProperty(user.userId)) {
                        socket.emit('leaveRoom', {result: false, message: "该用户没有加入房间"});
                        return;
                    }
                    delete roomList[roomId].userList[user.userId]
                    socket.leave(roomId)
                    console.log(user.name + "离开了房间")
                    sockets.to(roomId).emit('leaveRoom', {result: true, leaveUser: user});
                }
            } catch (e) {
                console.log("Leave room has error")
                console.log(e)
            }
        })

        /**
         * 关闭房间
         */
        socket.on('closeRoom', function (data) {
            try {
                var roomId = data.roomId;
                delete roomList[roomId];
                console.log(roomId + "房间关闭")
                sockets.to(roomId).emit('closeRoom', {result: true, message: "房主关闭房间"})
                socket.leave(roomId)
            } catch (e) {
                console.log("Close room has error")
                console.log(e)
            }
        })

        /**
         * 开始游戏
         */
        socket.on('startGame', function (data) {
            try {
                var roomId = data.roomId;
                roomList[roomId].start = true;
                console.log(`${roomId}房间的玩家上桌，准备开始游戏`)
                sockets.to(roomId).emit('startGame', {result: true, message: "游戏开始，上桌...."});
            } catch (e) {
                console.log(e)
            }
        })

        /**
         * 获取房间信息
         */
        socket.on('roomInfo', function (data) {
            var {roomId,user} = data;
            if (roomList[roomId].userList.hasOwnProperty(user.userId)) {
                socket.join(roomId);
            }
            socket.emit('roomInfo', {result: true, room: roomList[roomId]});
        })

        /**
         * 设置房间最低筹码
         */
        socket.on('setMinChip', function (data) {
            try {
                var {roomId, minChip} = data;
                if (roomList[roomId] == null) socket.emit('setMinChip', {result: false, message: '没有该房间'})
                roomList[roomId].minChip = Number(minChip);
                console.log(`${roomId}房间设置最低下注筹码${minChip}元`)
                socket.emit('setMinChip', {result: true, message: '设置成功'})
            } catch (e) {
                console.log("-----------Set Min Chip has error")
                console.log(e)
            }
        })

        /**
         * 准备游戏
         */
        socket.on('readyGame', function (data) {
            try {
                var {roomId, user} = data;
                if (roomList[roomId] != null) {
                    if (!roomList[roomId].userList.hasOwnProperty(user.userId)) {
                        socket.emit('readyGame', {result: false, message: "该用户没有加入房间"});
                        return;
                    }
                    roomList[roomId].userList[user.userId].ready = true;
                    console.log(roomId + "房间的" + user.name + "准备游戏")

                    if (isAllReady(roomList[roomId])) {  //判断是否可以下注
                        roomList[roomId].allReady = true;
                        console.log(roomId + "房间的玩家已经全部准备，可以开始下注")
                        sockets.to(roomId).emit('readyGame', {room: roomList[roomId], allReady: true});
                        return;
                    }
                    sockets.to(roomId).emit('readyGame', {result: true, readyUser: user});
                }
            } catch (e) {
                console.log("-----------Ready game has error")
                console.log(e)
            }
        })

        /**
         * 取消准备游戏
         */
        socket.on('cancleReady', function (data) {
            var {roomId, user} = data;
            if (roomList[roomId] != null) {
                if (!roomList[roomId].userList.hasOwnProperty(user.userId)) {
                    socket.emit('cancleReady', {result: false, message: "该用户没有加入房间"});
                    return;
                }
                roomList[roomId].userList[user.userId].ready = false
                console.log(roomId + "房间的" + user.name + "取消准备")
                sockets.to(roomId).emit('cancleReady', {result: true, cancleReadyUser: user});
            }
        })

        /**
         * 下注
         */
        socket.on('bet', async(data) => {
            try {
                var {roomId, user} = data;
                var money = Number(data.money)
                if (roomList[roomId] != null) {
                    if (!roomList[roomId].userList.hasOwnProperty(user.userId)) {
                        socket.emit('bet', {result: false, message: "该用户没有加入房间"});
                        return;
                    }
                    if (money < roomList[roomId].minChip) {
                        socket.emit('bet', {result: false, message: "下注不能低于最低下注筹码"})
                        return;
                    }
                    if (money > user.interal) {
                        socket.emit('bet', {result: false, message: "下注不能高于自身积分"})
                        return;
                    }
                    roomList[roomId].userList[user.userId].bet = money;

                    console.log(`${roomId}房间的${user.name}下注${money}元`)
                    sockets.to(roomId).emit('bet', {result: true, betUser: user, money: money});
                    if (isAllBet(roomList[roomId])) {  //判断是否全部下注s
                        //发牌
                        threeman.setPlayer(roomList[roomId].userList, roomList[roomId].poker);
                        console.log(roomId + "房间的玩家已经全部下注，可以开始发牌")
                        sockets.to(roomId).emit('deal', {room: roomList[roomId]});
                        //5秒后显示结果
                        try {
                            await setTimeout(async() => {
                                let session = await yuanData.createSession();
                                var userArray = count(roomList[roomId].userList);

                                //更新用户数据
                                await Promise.all(userArray.map(user =>
                                    session.execute(`update {user}`, {
                                        userId: user.userId,
                                        interal: (Number(user.interal) + user.result.count)
                                    })
                                ));
                                //添加积分记录
                                await Promise.all(userArray.map(user =>
                                    session.execute(`add {record}`, {interal:user.result.count,user:{userId:user.userId}})
                                ));
                                sockets.to(roomId).emit('compare', {userArray});
                                console.log(`${roomId}房间显示结果完毕，等待房主开始下一轮游戏`)
                            }, 15000);
                        } catch (err) {
                            console.log("The calculation results error")
                            console.log(err)
                        }
                        return;
                    }
                }
            } catch (e) {
                console.log(e)
            }
        })

        /**
         * 结束本轮游戏，准备下一轮
         */
        socket.on('endGame', function (data) {
            console.log(`${data.roomId}房间的本轮游戏结束`)
            //初始化改房间所有人的信息
            initGame(data.roomId);
            sockets.to(data.roomId).emit('endGame', {result: true, message: "结束本轮游戏", room:roomList[data.roomId]})
        })

        // /**
        //  * 玩家退出桌面
        //  */
        // socket.on('leaveGame', function (data) {
        //     var {roomId,user} = data;
        //     if(roomList[roomId].userList[userId].ready) {
        //         socket.to(data.roomId).emit('leaveGame', {result: false, message: "游戏进行中,不能退出"});
        //         return;
        //     }
        //     delete roomList[roomId].userList[user.userId]; //删除房间用户信息
        //     console.log(`${data.roomId}房间的${user.name}退出桌面`)
        //     sockets.to(data.roomId).emit('leaveGame', {result: true, leaveUser: user})
        // })
        //
        // /**
        //  * 房主关闭游戏
        //  */
        // socket.on('closeGame', function (data) {
        //     console.log(`${data.roomId}房间的房主关闭游戏`)
        //     //初始化改房间所有人的信息
        //     roomList[data.roomId].start = false;
        //
        //     sockets.to(data.roomId).emit('closeGame', {result: true, message: "房主关闭游戏"})
        // })

    });
}

/**
 * 初始化改房间所有人的信息
 * @param roomId
 */
function initGame(roomId) {
    delete roomList[roomId].allReady;
    for (var userId in roomList[roomId].userList) {
        delete roomList[roomId].userList[userId].result;
        delete roomList[roomId].userList[userId].poker;
        roomList[roomId].userList[userId].ready = false;
        roomList[roomId].userList[userId].bet = 0;
    }
}


/**
 * 判断用户是否已经加入房间
 * @param user
 * @returns {boolean}
 */
function checkUser(user) {
    if (roomList == null) return false;
    var result = false;
    for (var roomId in roomList) {
        var userList = roomList[roomId].userList
        if (userList == null) continue;
        if (userList.hasOwnProperty(user.userId)) result = true;
    }
    return result;
}

/**
 * 判断是否可以开始下注（全部准备）
 * @param room
 */
function isAllReady(room) {
    var users = room.userList;
    for (var userId in users) {
        var user = users[userId];
        if (!user.ready) return false; //只要有一个没有准备，都不能开始
    }
    return true;
}

/**
 * 判断是否可以开始游戏 （全部下注）
 * @param room
 */
function isAllBet(room) {
    var userList = room.userList;
    for (var userId in userList) {
        var user = userList[userId];
        if (!(user.bet > 0)) return false; //只要有一个没有下注，都不能开始
    }
    return true;
}

/**
 * 将list转成array
 * @param userList
 */
function objectToArray(userList) {
    var userArray = [];
    for (var i in userList) {
        userArray.push(userList[i])
    }
    return userArray;
}

/**
 * 计算结果
 * @param userList
 */
function count(userList) {
    //计算每个玩家的牌型大小
    var userArray = objectToArray(userList).map(user => {
      user.result = threeman.count(user.poker)
      return user;
    })

    //给玩家的牌排序
    userArray.sort(threeman.compare);
    userArray.forEach( (user, index )=>{
        user.result.sort = index;
    })
    //计算玩家下注总金额
    var sum_money = userArray.reduce((all, current) => all + Number(current.bet), 0);

    //计算玩家从下注池中获得的金额
    userArray.forEach(user => {
        if (sum_money > 0) {
            if ((sum_money - Number(user.bet)) > 0) {
                if ((sum_money - 2 * Number(user.bet)) > 0) { //玩家可以获得下注池中 自己本金的2倍
                    user.result.count = Number(user.bet);
                    sum_money = sum_money - 2 * Number(user.bet);
                } else {  //下注池的最后一部分，除了玩家本金还有余
                    user.result.count = sum_money - Number(user.bet); //正数
                    sum_money = 0;
                }
            } else {  // 下注池的最后一部分，不够玩家本金
                user.result.count = sum_money - Number(user.bet); //负数
                sum_money = 0;
            }
        } else { //下注池已经没金额
            user.result.count = -Number(user.bet);
        }
    })
    return userArray;
}

