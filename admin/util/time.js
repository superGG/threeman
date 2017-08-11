const forMatTargetTime = (targetTime) => {
  if(!targetTime){
    return '❌未记录'
  }

    let a = (new Date(new Date().toDateString()) - new Date(targetTime)) / (24* 60 * 60 * 1000)
    if(a<0 && a>=-1){
      return '今天'
    }else if(a >= 0 && a<=30){
      return `${Math.floor(a)+1}天前`
    }else if(a < -1){
      return `${Math.abs(Math.floor(a))-1}天后`
    }else {
      return `${Math.floor(a/30)}月前`
    }
}

export default forMatTargetTime