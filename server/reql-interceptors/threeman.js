

exports.poker = [
    {"number": 1, "color": 1}, {"number": 2, "color": 1}, {"number": 3, "color": 1}, {
        "number": 4,
        "color": 1
    }, {"number": 5, "color": 1}, {"number": 6, "color": 1}, {"number": 7, "color": 1}, {
        "number": 8,
        "color": 1
    }, {"number": 9, "color": 1}, {"number": 10, "color": 1}, {"number": 11, "color": 1}, {
        "number": 12,
        "color": 1
    }, {"number": 13, "color": 1},
    {"number": 1, "color": 2}, {"number": 2, "color": 2}, {"number": 3, "color": 2}, {
        "number": 4,
        "color": 2
    }, {"number": 5, "color": 2}, {"number": 6, "color": 2}, {"number": 7, "color": 2}, {
        "number": 8,
        "color": 2
    }, {"number": 9, "color": 2}, {"number": 10, "color": 2}, {"number": 11, "color": 2}, {
        "number": 12,
        "color": 2
    }, {"number": 13, "color": 2},
    {"number": 1, "color": 3}, {"number": 2, "color": 3}, {"number": 3, "color": 3}, {
        "number": 4,
        "color": 3
    }, {"number": 5, "color": 3}, {"number": 6, "color": 3}, {"number": 7, "color": 3}, {
        "number": 8,
        "color": 3
    }, {"number": 9, "color": 3}, {"number": 10, "color": 3}, {"number": 11, "color": 3}, {
        "number": 12,
        "color": 3
    }, {"number": 13, "color": 3},
    {"number": 1, "color": 4}, {"number": 2, "color": 4}, {"number": 3, "color": 4}, {
        "number": 4,
        "color": 4
    }, {"number": 5, "color": 4}, {"number": 6, "color": 4}, {"number": 7, "color": 4}, {
        "number": 8,
        "color": 4
    }, {"number": 9, "color": 4}, {"number": 10, "color": 4}, {"number": 11, "color": 4}, {
        "number": 12,
        "color": 4
    }, {"number": 13, "color": 4}
]

/**
 * 发牌
 * @param poker
 * @param hasPoker
 */
function handOutToPlayer(poker, hasPoker) {
    var player = [];
    while (player.length < 3) { //每人3张
        var i;
        do {
            i = Math.floor(Math.random() * poker.length);
        } while (dissRepeta(i, hasPoker) == 1); //存在则重新发牌
        player.push(poker[i])
    }
    return player;
}

/**
 * 记录发牌，检测发牌重复；已存在返回1，不存在则记录
 * @param i
 * @param hasPoker
 */
function dissRepeta(i, hasPoker) {
    return hasPoker.indexOf(i) != -1 ? 1 : hasPoker.push(i);
}

/**
 * 发牌
 * @param userList 玩家列表
 * @param poker 扑克牌
 */
exports.setPlayer = (userList, poker) => {
    if (userList.length * 3 > poker.length) throw new Error('牌不够发了');
    var hasPoker = []
    // for (var i = 0; i < playerNumber; i++) {
    //     players.push(handOutToPlayer(poker, hasPoker));
    // }
    for (var i in userList) {
        // var user = userList[i];
        userList[i].poker = handOutToPlayer(poker, hasPoker);
    }
    // var banker = handOutToPlayer(poker, hasPoker);
    // handOutPoker.banker = banker;  //没有庄家
    return userList;
}



/**
 *  计算玩家牌的等级与大小
 * @param poker
 */
function count(poker) {
    var result = {number: 0, man: 0, rank: 0, mix:{number:0,color:0}};
    for (var i in poker) {
        //记录最大的一张牌
        if (poker[i].number > result.mix.number){
            result.mix = poker[i];
        } else if (poker[i].number == result.mix.number){
            if (poker[i].color < result.mix.color) result.mix = poker[i];
        }
        //计算点数和公牌数
        if (poker[i].number == 11 || poker[i].number == 12 || poker[i].number == 13) {
            result.man++;
        } else {
            result.number += poker[i].number;
        }
    }
    result.number = Number(result.number) % 10;
    //计算手牌倍数
    result.man == 3 ? result.rank = 5 : result.rank = 1;
    // if (result.man == 3) {
    //     if (poker[0].number == poker[1].number && poker[1].number == poker[2].number) {
    //         result.rank = 9;  //大三公 9倍
    //     } else {
    //         result.rank = 5;  //混三公  5倍
    //     }
    // } else {
    //     if (poker[0].number == poker[1].number && poker[1].number == poker[2].number) {
    //         result.rank = 7; //小三公  7倍
    //     } else if(result.number == 8 || result.number == 9) {
    //         result.rank = 3;  //特点数  3倍
    //     } else {
    //         result.rank = 1; //单点数 1倍
    //     }
    // }
    return result;
}

/**
 * 比牌
 * @param player 玩家1
 * @param banker 玩家2
 */
exports.compare = (player, banker) => {
    var b_result = count(banker);
    var p_result = count(player);
    if(b_result.rank == p_result.rank){ //等级一样
        if (b_result.number == p_result.number){ //点数一样
            if (b_result.man == p_result.man) {     //公牌数 一样
                if(b_result.mix.number == p_result.mix.number) { //最大一张牌的大小一样
                   return b_result.mix.color < p_result.mix.color ?  false : true;
                } else {//最大一张牌的大小不一样， 大的赢
                   return b_result.mix.number > p_result.mix.number ?   false : true;
                }
            } else { //公派数不一样， 公牌数多的赢
                return b_result.man > p_result.man ?   false : true;
            }
        } else {  //点数不一样，点数大的赢
            return b_result.number > p_result.number ?   false : true;
        }
    } else {  //等级不一样,等级大的赢
        return b_result.rank > p_result.rank ?   false : true;
    }
}

/**
 * 与庄家比牌(旧的)
 * @param player
 * @param banker
 */
function old_compare(player, banker) {
    var result = {}
    var b_result = count(banker);
    var p_result = count(player);
    if(b_result.rank == p_result.rank){ //等级一样
        if (b_result.number == p_result.number){ //点数一样
            if (b_result.man == p_result.man) {     //公牌数 一样
                if(b_result.mix.number == p_result.mix.number) { //最大一张牌的大小一样
                    b_result.mix.color < p_result.mix.color ?  result.poker = banker : result.poker = player;
                } else {//最大一张牌的大小不一样， 大的赢
                    b_result.mix.number > p_result.mix.number ?  result.poker = banker : result.poker = player;
                }
            } else { //公派数不一样， 公牌数多的赢
                b_result.man > p_result.man ?  result.poker = banker : result.poker = player;
            }
        } else {  //点数不一样，点数大的赢
            b_result.number > p_result.number ?  result.poker = banker : result.poker = player;
        }
    } else {  //等级不一样,等级大的赢
        b_result.rank > p_result.rank ?  result.poker = banker : result.poker = player;
    }
    result.poker == player ? result.times = p_result.rank : result.times = b_result.rank;
    result.poker == player ? result.winner = "player" : result.winner = "banker";
    return result;
}

