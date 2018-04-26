var mousetimeout;
var screensaver_active = false;
var idletime = 300; //300s (5 min)
/*global $*/

function show_screensaver(){
    $('#screensaver').fadeIn();
    screensaver_active = true;
    screensaver_animation();
}

function stop_screensaver(){
    $('#screensaver').fadeOut();
    screensaver_active = false;
}

function getRandomColor() {
    var colors = ["black","white","#1975bc","#61c491","#f44641","#00bff3","#555555", "gray"];
    return colors[Math.round(Math.random() * 7)];
}

$(document).mousemove(function(){
    clearTimeout(mousetimeout);
    if (screensaver_active) {
        stop_screensaver();
    }

    mousetimeout = setTimeout(function(){
        window.setInterval(function(){
            show_screensaver()
        }, 10000);
    }, 1000 * idletime); // 5 secs			
});

function screensaver_animation(){
    if (screensaver_active) {
        $('#screensaver').css('background-color', getRandomColor());
    }
}