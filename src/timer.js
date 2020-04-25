const electron = require('electron')
const path = require('path')
const url = require('url')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote
const wallpaper = require('wallpaper');
var fs = require('fs');
var request = require('request');
const shutdown = require('electron-shutdown-command');
const isDev = require('electron-is-dev');
var log = require('electron-log');

// ipc that sends message to main.js
const ipc = electron.ipcRenderer

// Data Persistant
const Store = require('electron-store');
const store = new Store();

// main url is fetched from main window
var url_main = get_main_url();
var sync_interval = 10 * 1000;

// total mins after which warning box is shown
var min_warning = 10;
// minimum mins after which computer will auto shutdown
var min_auto_shutdown = 0; // prev was 30 minutes

var url_logout = url_main + '/cyber/logout';
var url_refresh_balance = url_main + '/cyber/balance/refresh';
// var url_sync = url_main + '/cyber/sync/client';
// const url_sync = url_main + '/cyber/request';

var registration_code = store.get('registration_code');
var cyber_id = store.get('cyber_id');
var user_id = store.get('user_id');
var username_last = store.get('username');
var balance = store.get('user_balance'); // time in minutes
var login_type = store.get('login_type');
var btn_logout = $("#btn-logout");
var btn_refresh = $('#btn-refresh');
var is_refreshing = false;
var msg_area = $("#message");
var warning_shown = false;

// time reserved in seconds
var reserved_time = balance*60; 
var start_time= +new Date();
var balance_remain = reserved_time;
var stop_sync = false;


startup();


btn_logout.click(function(e) {
    e.preventDefault();
    var me = $(this);

    // remove username when User logs out
    api_logout(me);
});

btn_refresh.click(function(e) {
    e.preventDefault();

    // prevent double fetching
    if (is_refreshing) {
        return;
    }
    is_refreshing = true;

    $(this).html('refreshing...').prop('disabled', true);
    // update user time
    api_refresh_user_time();
});

/**
 * Show the time left fetched from server
 */
function display_time(result) {
    var elapsed_time_str = result.elapsed_time_str;
    
    $(".timer").text( elapsed_time_str );

    $(".login-time").text( "Login Time: " + result.start_time );

    $(".username span").text( username_last );
}

/**
 * Update timer every seconds
 */
function update_timer() {
    var elapsed = +new Date() - start_time; // in seconds
    var remain_seconds = reserved_time - Math.floor(elapsed/1000);
    console.log(reserved_time + ', ' + remain_seconds + ', ' + elapsed);
    var time_overextended = (remain_seconds <= (-min_auto_shutdown*60)) ? true : false; // allows to extend up to 30 minute
    var time_finished = (remain_seconds <= 0) ? true : false;
 
    // show warning popup when time is less than given minutes
    if (remain_seconds <= (min_warning*60) && !warning_shown) {
        console.log('show warning');
        
        // show warning popup
        var dimen = getWidowDimensions();
        var win_info = {
            'width' : 600,
            'height' : 100,
            'x' : dimen.width/2 - 600/2,
            'filepath' : 'warning.html',
            'canClose' : true,
            'showDev' : false,
            'isFullscreen' : false,
            'isAlwaysOnTop' : true,
            'closeParent' : false
        };
        open_window(win_info);

        warning_shown = true;
    }

    // if time goes smaller than 15 minutes, computer is logged out
    if (time_overextended) {
        api_logout(btn_logout);
        return;
    }
 
    // get displayable string
    var str_display_time = get_display_time(remain_seconds);
    if (time_finished) {
        // display time in extended mode
        str_display_time = get_reverse_time(remain_seconds);
    }
 
    $(".timer").text( str_display_time );
 
    setTimeout(function(){update_timer()}, 1000);
 }

 /**
  * Get time extended
  * 
  * @param {int} remain_seconds 
  */
 function get_reverse_time(remain_seconds) {
    remain_seconds %= 3600;
    var minutes = Math.floor(remain_seconds / 60);
    minutes = Math.abs(minutes);
    var str = (minutes <= 1) ? 'minute' : 'minutes';
    return 'Time expired by ' + minutes + ' ' + str + '.';
 }
 
 /**
 * Get string display for timer
 * @param {int} remain_seconds
 */
 function get_display_time(remain_seconds) {
    var hours = Math.floor(remain_seconds / 3600);
    var hours_val = hours;
    if (hours < 10) {
        hours = '0' + hours;
    }
    remain_seconds %= 3600;
    var minutes = Math.floor(remain_seconds / 60);
    var minutes_val = minutes;
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    remain_seconds = remain_seconds - (minutes*60);
    if (remain_seconds < 10) {
        remain_seconds = '0' + remain_seconds;
    }
 
    // update remaining time
    update_balance_remain(hours_val*60 + minutes_val);
   
    return  hours + ':' + minutes + ':' + remain_seconds;
}

// update balance
function update_balance_remain(num) {
    balance_remain = num;
}

/**
 * Handle startup actions
 */
function startup() {
    $("#balance").html('initial balance : ' + balance);

    // start minus countdown
    update_timer();
    // show username
    $(".username span").text( username_last );
    // show start time
    var today = new Date();
    $(".login-time").text('Start Time: ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds());
    
    // set wallpaper
    var today = new Date();
    var hours = today.getHours();
    var num = Math.floor(hours/6);
    if (num>=24) { num = 4; }
    if (num>4) { num = 4; }
    var img_path = 'https://www.cloud9gaminghub.com/sites/default/files/wallpapers/wallpaper' + num + '.jpg';

    // download the image and set it as wallpaper
    download_me(img_path, 'wallpaper.jpg', function(){
        wallpaper.set('wallpaper.jpg').then(()=>{
            console.log("image set");
        });
    });
}

function download_me(uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};