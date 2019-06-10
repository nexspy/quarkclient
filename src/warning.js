const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote



var time = 0;

var bg_color = 'red';

start();



function start() {
    update_timer();
}


function playSound() {
    var sound = document.getElementById("audio");
    sound.play();
}


function update_timer() {
    time++;

    if (bg_color == 'red') {
        bg_color = 'blue';
    } else {
        bg_color = 'red';
    }
    $('#low-balance').css('background-color', bg_color);

    // close automatically after 1 minute
    if (time <= 60) {
        playSound();
    } else {
        var window = remote.getCurrentWindow();
        window.close();
    }

    setTimeout(function(){update_timer()}, 1000);
}


