let poker = [
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
 * @param playerNumber 闲家人数
 * @param poker 扑克牌
 */
function setPlayer(playerNumber, poker) {
    if (playerNumber * 3 > poker.length) throw new Error('牌不够发了');
    var handOutPoker = {}
    var players = []
    var hasPoker = []
    for (var i = 0; i < playerNumber; i++) {
        players.push(handOutToPlayer(poker, hasPoker));
    }
    var banker = handOutToPlayer(poker, hasPoker);
    handOutPoker.banker = banker;
    handOutPoker.players = players;
    return handOutPoker;
}

// var hasPoker = []
// var p1 = handOutToPlayer(poker, hasPoker);
// var p2 = handOutToPlayer(poker, hasPoker);
// var p3 = handOutToPlayer(poker, hasPoker);
// var banker = handOutToPlayer(poker, hasPoker);

// for (var i=0; i< 1000;i++){
//     hasPoker =[]
//     var p1 = handOutToPlayer(poker, hasPoker);
//     var p2 = handOutToPlayer(poker, hasPoker);
//     var p3 = handOutToPlayer(poker, hasPoker);
//     var banker = handOutToPlayer(poker, hasPoker);
//     var result_1 = compare(p1,banker);
//     var result_2 = compare(p2,banker);
//     var result_3 = compare(p3,banker);
//     console.log("-------------------------------------------完美分割线------------------------------------------")
//     console.log("the player1's poker is :"+JSON.stringify(p1)+" ,and the result is : " + JSON.stringify(count(p1)));
//     console.log("the player2's poker is :"+JSON.stringify(p2)+" ,and the result is : " + JSON.stringify(count(p2)));
//     console.log("the player3's poker is :"+JSON.stringify(p3)+" ,and the result is : " + JSON.stringify(count(p3)));
//     console.log("the banker's poker is :"+JSON.stringify(banker)+" ,and the result is : " + JSON.stringify(count(banker)));
//     console.log(`玩家1 与 庄家比牌结果，赢家${result_1.winner},倍率为${result_1.times}`)
//     console.log(`玩家2 与 庄家比牌结果，赢家${result_2.winner},倍率为${result_2.times}`)
//     console.log(`玩家3 与 庄家比牌结果，赢家${result_3.winner},倍率为${result_3.times}`)
//     console.log("发牌数：" + hasPoker)
// }


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
    if (result.man == 3) {
        if (poker[0].number == poker[1].number && poker[1].number == poker[2].number) {
            result.rank = 9;  //大三公 9倍
        } else {
            result.rank = 5;  //混三公  5倍
        }
    } else {
        if (poker[0].number == poker[1].number && poker[1].number == poker[2].number) {
            result.rank = 7; //小三公  7倍
        } else if(result.number == 8 || result.number == 9) {
            result.rank = 3;  //特点数  3倍
        } else {
            result.rank = 1; //单点数 1倍
        }
    }
    return result;
}

/**
 * 与庄家比牌
 * @param player
 * @param banker
 */
function compare(player, banker) {
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

