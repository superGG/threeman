

(function() {

  var tansferNumToPic = function(numArr) {

    return numArr.map(function(item, index){

      var num = Math.ceil(item / 4);
      var afr = item % 4 === 0 ? 3 : item % 4 - 1;

      return num + "_" + afr + ".png"
    })
  }

  var poker = [];

  for(var i = 1, len = 52; i <= len; i ++) {

    poker.push(i)
  }

  console.log(poker);

  poker.sort(function() {

    return 0.5 - Math.random()
  });

  console.log(poker);

  var myPoker = poker.splice(0, 3);


  var myPokerPng = tansferNumToPic(myPoker);

  console.log(myPoker);

  $(".my .poker img").each(function(i) {

    $(this).attr("src", "./public/poker/" + myPokerPng[i])
  });

  var width = document.documentElement.clientWidth;
  var height =  document.documentElement.clientHeight;
  if( width < height ){
    console.log(width + " " + height);
    $print =  $('#print');
    $print.width(height);
    $print.height(width);
    $print.css('top',  (height-width)/2 );
    $print.css('left',  0-(height-width)/2 );
    $print.css('transform' , 'rotate(90deg)');
    $print.css('transform-origin' , '50% 50%');
  }

  var evt = "onorientationchange" in window ? "orientationchange" : "resize";

  window.addEventListener(evt, function() {
    console.log(evt);
    var width = document.documentElement.clientWidth;
    var height =  document.documentElement.clientHeight;
    $print =  $('#print');
    if( width > height ){

      $print.width(width);
      $print.height(height);
      $print.css('top',  0 );
      $print.css('left',  0 );
      $print.css('transform' , 'none');
      $print.css('transform-origin' , '50% 50%');
    }
    else{
      $print.width(height);
      $print.height(width);
      $print.css('top',  (height-width)/2 );
      $print.css('left',  0-(height-width)/2 );
      $print.css('transform' , 'rotate(90deg)');
      $print.css('transform-origin' , '50% 50%');
    }

  }, false);

})();