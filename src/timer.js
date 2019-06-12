const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote
const wallpaper = require('wallpaper');
var fs = require('fs');
var request = require('request');
const shutdown = require('electron-shutdown-command');
var log = require('electron-log');

// ipc that sends message to main.js
const ipc = electron.ipcRenderer

// Data Persistant
const Store = require('electron-store');
const store = new Store();

// main url is fetched from main window
var url_main = store.get('main_url', '');
url_main = 'http://quark.modificationdharan.com';
var sync_interval = 10 * 1000;


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
var msg_area = $("#message");
var warning_shown = false;
var in_refresh = false;

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
    request_logout(me);
});


btn_refresh.click(function(e) {
    e.preventDefault();

    request_refresh_balance();
});

/**
 * Fetch current user balance from server
 */
function request_refresh_balance() {
    log.info('fetch balance update from server');

    if (in_refresh) {
        return;
    }
    in_refresh = true;

    var params = new URLSearchParams();
    params.append('registration_code', registration_code);
    params.append('cyber_id', cyber_id);
    params.append('user_id', user_id);

    axios.post(url_refresh_balance, params)
        .then(function (response) {
            console.log(response.data);
            
            if (response.data.success) {
                // reset balance
                balance = parseInt(response.data.current_balance);
                store.set('user_balance', balance);
                
                // update calculation variables
                reserved_time = balance*60;
            } else {
                // do nothing
            }

            in_refresh = false;
        })
        .catch(function (error) {
            console.log(error);
            console.log('something went wrong');
        });
}

/**
 * Logout user and shutdown, all user related data is reset
 */
function request_logout(button) {
    log.info('logging out...');

    if (button) {
        button.prop('disabled', true);
    }
    
    var params = new URLSearchParams();
    params.append('registration_code', registration_code);
    params.append('cyber_id', cyber_id);

    if (button) {
        if (user_id > 0) {
            params.append('op', 'user_logout');
            params.append('user_id', user_id);
            params.append('balance', balance_remain);
        } else {
            // normal logout
            params.append('op', 'normal_logout');
        }
    } else {
        params.append('op', 'computer_logout');
    }

    
    axios.post(url_logout, params)
        .then(function (response) {
            console.log(response.data);
            if (response.data.success) {
                // reset balance
                balance = 0;
                store.set('user_balance', balance);
               
                store.delete('login_type');
                store.delete('username');
                store.delete('user_balance');
                store.delete('user_id');
                store.delete('ready_to_close');
                shutdownComputer();
            } else {
                store.delete('username');
                store.delete('user_balance');
                store.delete('user_id');
                store.delete('ready_to_close');
                shutdownComputer();
                console.log('something went wrong');
            }
            
        })
        .catch(function (error) {
            console.log(error);
            console.log('something went wrong');
        });

    
}

/**
 * Open the main lockscreen window
 */
function shutdownComputer() {
    
    store.delete('ready_to_close');

    log.info('computer will now shutdown...');

    stop_sync = true;

    log.info('shutdown');
    shutdown.shutdown();

    return;
}

/**
 * Show the time left fetched from server
 */
function display_time(result) {
    console.log(result);
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
    var time_overextended = (remain_seconds <= (-30*60)) ? true : false; // allows to extend up to 30 minute
    var time_finished = (remain_seconds <= 0) ? true : false;
 
    // show popup when time is less than 5 minutes
    if (remain_seconds <= (5*60) && !warning_shown) {
        console.log('show warning');
        show_warning();
        warning_shown = true;
    }

    // if time goes smaller than 15 minutes, computer is logged out
    if (time_overextended) {
        request_logout(btn_logout);
        return;
    }
 
    // get displayable string
    var str_display_time = get_display_time(remain_seconds);
    if (time_finished) {
        // display time in extended mode
        str_display_time = get_reverse_time(remain_seconds);
    }
 
    $(".timer").text( str_display_time );
 
    // store data
    // user_time.time = balance*60 - remain_seconds;
    // store.set('last_time_store', user_time);
 
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
 
 function update_balance_remain(num) {
    balance_remain = num;
 }
 

/**
 * Show popup AD
 */
function show_ad() {
    const modalPath = path.join('file://', __dirname, 'ad.html')
    var dimen = getWidowDimensions();
    var margin = 50;

    let win = new BrowserWindow({
        width: 720,
        height: 550,
        frame: false,
        x: dimen.width/2 - 720/2,
        y:dimen.height/2 - 550/2,
        alwaysOnTop: false,
        resizable: false,
        movable: false,
        minimizable: false,
        icon: __dirname + '/logo.ico',
    });
    
    // prevent closing of window
    win.on('close', function (event) {
        event.preventDefault();
    })
    win.on('closed', () => {
        win = null
    })
    win.loadURL(modalPath)
    // win.webContents.openDevTools()
    win.show();
}

/**
 * Show popup window
 */
function show_warning() {
    log.info('show warning...');
    warning_shown = true;
    const modalPath = path.join('file://', __dirname, 'warning.html')
    var dimen = getWidowDimensions();
    var margin = 50;

    let win = new BrowserWindow({
        width: 240,
        height: 150,
        frame: false,
        // x: dimen.width - 240 - margin,
        // y:dimen.height - 150 - margin,
        x: dimen.width/2 - 240/2,
        y: 0,
        alwaysOnTop: true,
        resizable: false,
        movable: false,
        minimizable: false,
        icon: __dirname + '/logo.ico',
    })
    
    // prevent closing of window
    win.on('close', function (event) {
        event.preventDefault();
    })
    win.on('closed', () => {
        win = null
    })
    win.loadURL(modalPath)
    // win.webContents.openDevTools()
    win.show();
}


// Get monitor/window dimensions
function getWidowDimensions() {
    var screenElectron = require('electron').screen;
    var mainScreen = screenElectron.getPrimaryDisplay();
    var dimensions = mainScreen.size;
    return dimensions;
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

    // send sync message to server
    // sync_server();
    
    // show AD
    // show_ad();

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