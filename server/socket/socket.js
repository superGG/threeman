/**
 * Created by Kellan on 2017/8/17.
 */
const threeman = require('../reql-interceptors/threeman')
const axios = require('axios')
// const UUID = require('node-uuid')


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
            // console.log(UUID.v1())
            socket.emit('test', data);
        });

        /**
         * 创建房间
         */
        socket.on('createRoom', async(data) => {
            try {
                var user = data.user
                let session = await yuanData.createSession();
                let db_user = await session.query(`query {user(userId=$userId):{userId,name,interal,image}}`, {userId: user.userId})
                user = db_user.getPlain();
                if (user != null && checkUser(user)) {
                    socket.emit('joinRoom', {result: false, message: "用户已经加入别的房间", code: 110});
                    return;
                }
                //移除空闲房间
                let time = new Date();
                Object.keys(roomList).forEach(_roomId => {
                    if ((time.getTime() - roomList[_roomId].lastOperationTime.getTime() > (1000 * 60 * 10))) {
                        delete roomList[_roomId];
                        sockets.to(_roomId).emit('removeRoom', {result: false, message: "超过10分钟没有操作，关闭房间", code: 321});
                        console.log(`${_roomId}超过10分钟没有操作，关闭房间`)
                    }
                })

                var room = {};
                room.userList = {};
                room.roomId = createRoomId(); //房间id
                if (room.roomId < 0) {
                    socket.emit('joinRoom', {result: false, message: "房间数已满", code: 123});
                    return;
                }
                room.lastOperationTime = new Date();
                room.minChip = 50;          //房间最低下注金额
                room.start = false;     //房间游戏状态
                user.ready = false;//玩家准备状态
                user.bet = 0; //玩家下注金额
                room.userList[user.userId] = user;
                room.poker = poker;
                roomList[room.roomId] = room;
                socket.join(room.roomId)
                console.log(`${user.name} player create the ${room.roomId} room`)
                sockets.to(room.roomId).emit('createRoom', {result: true, room});
            } catch (e) {
                console.log('Failed to create romm by the user')
                console.log(e)
            }
        });

        /**
         * 加入房间
         */
        socket.on('joinRoom', async(data) => {
            try {
                var {roomId, user} = data

                if (roomList[roomId] != null) {
                    roomList[roomId].lastOperationTime = new Date();

                    let session = await yuanData.createSession();
                    let db_user = await session.query(`query {user(userId=$userId):{userId,name,interal,image}}`, {userId: user.userId})
                    user = db_user.getPlain();
                    if (user != null && checkUser(user)) {
                        socket.emit('joinRoom', {result: false, message: "用户已经加入别的房间", code: 110});
                        return;
                    }

                    if (roomList[roomId].start) {
                        socket.emit('joinRoom', {result: false, message: "该房间已经开始游戏", code: 111});
                        return;
                    }
                    if (user.interal < roomList[roomId].minChip) {
                        socket.emit('joinRoom', {result: false, message: "该用户的积分不够", code: 112});
                        return;
                    }
                    if (Object.keys(roomList[roomId].userList).length >= 6) {
                        socket.emit('joinRoom', {result: false, message: "房间已满人", code: 113});
                        return;
                    }
                    user.ready = false;//玩家准备状态
                    user.bet = 0; //玩家下注金额
                    roomList[roomId].userList[user.userId] = user;
                    socket.join(roomId)
                    console.log(`${user.name} player join the ${roomId} room`)
                    sockets.to(roomId).emit('joinRoom', {result: true, room: roomList[roomId]});
                } else {
                    socket.emit('joinRoom', {result: false, message: "该房间已关闭"});
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
                    roomList[roomId].lastOperationTime = new Date();
                    if (!roomList[roomId].userList.hasOwnProperty(user.userId)) {
                        socket.emit('leaveRoom', {result: false, message: "该用户没有加入房间"});
                        return;
                    }
                    sockets.to(roomId).emit('leaveRoom', {result: true, leaveUser: [user.userId]});
                    delete roomList[roomId].userList[user.userId]
                    socket.leave(roomId)
                    console.log(`${user.name} player leave the ${roomId} room`)
                } else {
                    socket.emit('leaveRoom', {result: false, message: "该房间已关闭"});
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
                if (roomList[roomId] != null) {
                    roomList[roomId].lastOperationTime = new Date();
                    delete roomList[roomId];
                    sockets.to(roomId).emit('closeRoom', {result: true, message: "房主关闭房间"})
                    socket.leave(roomId)
                    console.log(`Close the ${roomId} room `)
                } else {
                    socket.emit('closeRoom', {result: false, message: "该房间已关闭"});
                }
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
                if (roomList[roomId] != null) {
                    roomList[roomId].lastOperationTime = new Date();
                    roomList[roomId].start = true;
                    sockets.to(roomId).emit('startGame', {result: true, message: "游戏开始，上桌...."});
                    console.log(`The ${roomId} room player began to game view, ready to the game`)
                } else {
                    socket.emit('startGame', {result: false, message: "该房间已关闭"});
                }
            } catch (e) {
                console.log(e)
            }
        })

        /**
         * 获取房间信息
         */
        socket.on('roomInfo', function (data) {
            try {
                var {roomId, user} = data;
                if (roomList[roomId] != null) {
                    roomList[roomId].lastOperationTime = new Date();
                    if (roomList[roomId].userList.hasOwnProperty(user.userId)) {
                        socket.join(roomId);
                        socket.emit('roomInfo', {result: true, room: roomList[roomId]});
                    } else {
                        socket.emit('roomInfo', {result: false, message: "用户不在该房间"});
                    }
                } else {
                    socket.emit('roomInfo', {result: false, message: "该房间已关闭"});
                }
            } catch (e) {
                console.log(e)
            }
        })

        /**
         * 设置房间最低筹码
         */
        socket.on('setMinChip', function (data) {
            try {
                var {roomId, minChip} = data;
                if (roomList[roomId] == null) {
                    roomList[roomId].lastOperationTime = new Date();
                    roomList[roomId].minChip = Number(minChip);
                    socket.emit('setMinChip', {result: true, message: '设置成功'})
                    console.log(`The ${roomId} room's new minChip is ${minChip} interal`)
                } else {
                    socket.emit('setMinChip', {result: false, message: '没有该房间'})
                }
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
                    roomList[roomId].lastOperationTime = new Date();
                    if (!roomList[roomId].userList.hasOwnProperty(user.userId)) {
                        socket.emit('readyGame', {result: false, message: "该用户没有加入房间"});
                        return;
                    }
                    if (Object.keys(roomList[roomId].userList).length < 2) {
                        socket.emit('readyGame',{reuslt:false,message:"人数过少，不能开始游戏"});
                        return;
                    }
                    roomList[roomId].userList[user.userId].ready = true;
                    sockets.to(roomId).emit('readyGame', {result: true, readyUser: user});
                    console.log(`The ${roomId} room's ${user.name} ready game`)
                    let ready_status = ReadyStatus(roomList[roomId]);
                    if (ready_status.noReadyNumber == 0) {  //判断是否可以下注
                        if (roomList[roomId].hasOwnProperty("ready_interval")) {//clear interval
                            clearInterval(roomList[roomId].ready_interval)
                            delete roomList[roomId].ready_interval;
                        }
                        console.log(`Stop the ${roomId} room's ready_interval`)
                        console.log(`The ${roomId} room's player has all ready, began to bet`)
                        roomList[roomId].allReady = true;
                        sockets.to(roomId).emit('readyGame', {room: roomList[roomId], allReady: true});
                        return;
                    }
                    if (!roomList[roomId].hasOwnProperty("ready_interval")) { //if the room no interval
                        try {
                            let time = 30;
                            roomList[roomId].ready_interval = setInterval(function () { //每秒
                                console.log(`The ${roomId} room's interval began:${time}`)
                                if (time <= 0) { //到时关闭
                                    clearInterval(roomList[roomId].ready_interval)
                                    // if ((Object.keys(roomList[roomId].userList).length - ready_status.noReadyUserList.length) < 2) { //If ready player not enough 2
                                    //     delete roomList[roomId];
                                    //     sockets.to(roomId).emit('closeRoom', {result: true, message: "人数不够,房间关闭"})
                                    //     console.log(`The ${roomId} room's player not enough, close the room`)
                                    // } else {
                                        sockets.to(roomId).emit('leaveRoom', {result: true, leaveUser: ready_status.noReadyUserList});
                                        ready_status.noReadyUserList.forEach(userId => { //delete the room's player message who not ready game
                                            console.log(`The ${roomId} room's ${roomList[roomId].userList[userId].name} not ready, auto leave the room`)
                                            delete roomList[roomId].userList[userId]
                                        })
                                    // }
                                }
                                sockets.to(roomId).emit('interval', {result:true, time});//send the interval time to view
                                time -= 1;
                            }, 1000)
                        } catch (e) {
                            console.log(`the ${roomId}room's interval have err`)
                            console.log(e)
                        }
                    }

                } else {
                    socket.emit('readyGame', {result: false, message: '没有该房间'})
                }
            } catch (e) {
                console.log("-----------Ready game has error")
                console.log(e)
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
                    roomList[roomId].lastOperationTime = new Date();
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
                    sockets.to(roomId).emit('bet', {result: true, betUser: user, money: money});
                    console.log(`The ${roomId} room's ${user.name} bet ${money}interal`)

                    let bet_status = BetStatus(roomList[roomId]);
                    if (bet_status.noBetNumber == 0) {  // If players already all bets
                        if (roomList[roomId].hasOwnProperty("bet_interval")) {//clear interval
                            clearInterval(roomList[roomId].bet_interval)
                            delete roomList[roomId].bet_interval;
                        }
                        console.log(`Stop the ${roomId} room's bet_interval`)
                        //发牌
                        threeman.setPlayer(roomList[roomId].userList, roomList[roomId].poker);
                        console.log(`Have players bet all of the ${roomId} room, start dealing poker`)
                        sockets.to(roomId).emit('deal', {room: roomList[roomId]});
                        //15秒后显示结果
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
                            await Promise.all(Object.keys(roomList[roomId].userList).map(async userId => {
                                    let temUser = await session.query(`query {user(userId=$userId):{interal,name}}`, {userId: Number(userId)})
                                    console.log(`The player ${temUser.name} newest interal is ${temUser.interal}`)
                                    roomList[roomId].userList[userId].interal = temUser.interal;
                                })
                            );
                            //添加积分记录
                            console.log("-------------------add record-------")
                            await Promise.all(userArray.map(user =>
                                session.execute(`add {record}`, {
                                    interal: user.result.count,
                                    user: {userId: user.userId}
                                })
                            ));
                            sockets.to(roomId).emit('compare', {userArray, room: roomList[roomId]});
                            console.log(`The ${roomId} room display the results finished, waiting for the owner to satrt the next round of game`)
                        }, 15000);
                        return;
                    }
                    if (!roomList[roomId].hasOwnProperty("bet_interval")) {
                        try {
                            let time = 30;
                            roomList[roomId].bet_interval = setInterval(function () {
                                console.log(`${roomId}房间倒计时开始，${time}`)
                                if (time <= 0) { //到时关闭
                                    clearInterval(roomList[roomId].bet_interval)
                                    if ((Object.keys(roomList[roomId].userList).length - bet_status.noReadyUserList.length) < 2) { //If ready player not enough 2
                                        delete roomList[roomId];
                                        sockets.to(roomId).emit('closeRoom', {result: true, message: "人数不够,房间关闭"})
                                        console.log(`The ${roomId} room's player not enough, close the room`)
                                    } else {
                                        sockets.to(roomId).emit('leaveRoom', { result: true,leaveUser: bet_status.noBetUserList});
                                        bet_status.noBetUserList.forEach(userId => { //delete the room's player message who not ready game
                                            console.log(`The ${roomId} room's ${roomList[roomId].userList[userId].name} not bet, auto leave the room`)
                                            delete roomList[roomId].userList[userId]
                                        })
                                    }
                                }
                                sockets.to(roomId).emit('interval', {result: true, time});//send the interval time to view
                                time -= 1;
                            }, 1000)
                        } catch (e) {
                            console.log(`the ${roomId} room's interval have err`)
                            console.log(e)
                        }
                    } else {
                        socket.emit('bet', {result: false, message: '没有该房间'})
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
            console.log(`The ${data.roomId} room end of game to the next round`)
            //初始化改房间所有人的信息
            if (roomList[data.roomId] != null) {
                roomList[data.roomId].lastOperationTime = new Date();
                initGame(data.roomId);
                sockets.to(data.roomId).emit('endGame', {result: true, message: "结束本轮游戏", room: roomList[data.roomId]})
            } else {
                socket.emit('endGame', {result: false, message: '没有该房间'})
            }
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
 * 生成一个2位数的roomId
 * @returns {*}
 */
function createRoomId() {
    var result = true;
    var roomId;
    var length = 0
    while (result && length < 90) {
        roomId = Math.floor(Math.random() * 89) + 10;
        result = roomList.hasOwnProperty(roomId) ? true : false
        length++;
    }

    return length == 90 ? -1 : roomId;
}

/**
 * 判断是否可以开始下注（全部准备）
 * @param room
 */
function ReadyStatus(room) {
    let ready_status = {};
    let users = room.userList;
    ready_status.noReadyNumber = Object.keys(users).length;
    ready_status.noReadyUserList = [];
    var user;
    for (var userId in users) {
        user = users[userId];
        !user.ready ? ready_status.noReadyUserList.push(userId) : ready_status.noReadyNumber--;
    }
    return ready_status;
}

/**
 * 判断是否可以开始游戏 （全部下注）
 * @param room
 */
function BetStatus(room) {
    let bet_status = {};
    let userList = room.userList;
    bet_status.noBetNumber = Object.keys(userList).length;
    bet_status.noBetUserList = [];
    for (var userId in userList) {
        var user = userList[userId];
        !(user.bet > 0) ? bet_status.noBetUserList.push(userId) : bet_status.noBetNumber--;
    }
    return bet_status;
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
    userArray.forEach((user, index) => {
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

