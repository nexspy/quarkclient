const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote



var time = 0;



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

    if (time <= 10) {
        playSound();
    } else {
        var window = remote.getCurrentWindow();
        window.close();
    }

    setTimeout(function(){update_timer()}, 1000);
}


