const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote
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
var url_sync = url_main + '/cyber/sync/client';
// const url_sync = url_main + '/cyber/request';

var registration_code = store.get('registration_code');
var cyber_id = store.get('cyber_id');
var user_id = store.get('user_id');
var username_last = store.get('username');
var balance = store.get('user_balance'); // time in minutes
var login_type = store.get('login_type');
var btn_logout = $("#btn-logout");
var msg_area = $("#message");
var warning_shown = false;


// time reserved in seconds
var reserved_time = balance*60; 
var start_time= +new Date();
var balance_remain = reserved_time;
var stop_sync = false;

// dev testing variable values ----------------------
// registration_code = 'U_G__0LJyyU51iZHuHztpQ';
// login_type = 'paid'; // its either 'free' or 'paid', free will have incremental timer, other will have decreasing timer
// balance = 5;
// reserved_time = balance*60;
// balance_remain = reserved_time;



startup();




btn_logout.click(function(e) {
    e.preventDefault();
    var me = $(this);

    // remove username when User logs out
    request_logout(me);
});


/**
 * Send Sync Request : check if machine has to be turned off
 * 
 * This request updates the 'last_sync' timestamp. Server constantly checks if last_sync is too old.
 * If last_sync is too old, and machine is still turned ON, then software was closed inproperly.
 */
function sync_server() {
    if (stop_sync) {
        return;
    }
    
    console.log("server request----");

    var params = new URLSearchParams();
    params.append('registration_code', registration_code);
    var action = 'sync';

    // member time should be updated as it elapses
    if (login_type == 'member') {
        // update the time
        action = 'update_member_time';
    }

    params.append('action', action);

    // DEPRECATED : member balance should also be updated
    // var balance = balance_remain;
    // params.append('new_balance', balance);

    // asks server to update the balance every minute
    params.append('up_minute', true);
    
    axios.post(url_sync, params)
        .then(function (response) {
            var result = response.data;
            if (result.success) {
                // 
                if (result.reset) {
                    balance = parseInt(result.reset_balance);
                    reserved_time = balance*60; 
                }
            }
            
            // update timer according to fetched remaining time
            display_time(result);
            
            // show warning
            if (result.remaining <= 5*60 && !warning_shown) {
                show_warning();
            }

            // time to turn off
            if (result.remaining <= 0) {
                log.info('time has run out');
                request_logout(false);
            }
            
            // non-member should be automatically logged out
            if (0 && login_type == 'nonmember') {
                // computer turned-off has no transaction
                if (!result.machine.transaction) {
                    request_logout(false);
                }
            }
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
 * Update the timer according to "balance" variable
 */
function update_timer() {
    var elapsed = +new Date() - start_time;
    var seconds_passed = reserved_time - Math.floor(elapsed/1000);

    if (login_type == 'nonmember') {
        elapsed = +new Date() - start_time;
        seconds_passed = Math.floor(elapsed/1000) + reserved_time;
    }

    if (seconds_passed <= 0) {
        request_logout();
    }

    // show popup
    if (seconds_passed <= (5*60 - 10) && !warning_shown && login_type == 'member') {
        console.log('show warning');
        show_warning();
    }

    var hours = Math.floor(seconds_passed / 3600);
    var hours_val = hours;
    if (hours < 10) {
        hours = '0' + hours;
    }
    seconds_passed %= 3600;
    var minutes = Math.floor(seconds_passed / 60);
    var minutes_val = minutes;
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    seconds_passed = seconds_passed - (minutes*60);
    if (seconds_passed < 10) {
        seconds_passed = '0' + seconds_passed;
    }
    
    var elapsed_time = hours + ':' + minutes + ':' + seconds_passed;

    // update remaining time
    balance_remain = hours_val*60 + minutes_val;
    // balance_remain = hours * 60 + minutes;

    $(".timer").text( elapsed_time );

    setTimeout(function(){update_timer()}, 1000);
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
        x: dimen.width - 240 - margin,
        y:dimen.height - 150 - margin,
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

// sets the application always on top no matter what
function set_alwaysonTop() {
    setInterval(function(){
      if (win) {
        win.setAlwaysOnTop(true);
      }
    }, 1);
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

    // update_timer();

    // send sync message to server
    // if (login_type == 'member') {
        sync_server();
        var timeout = setInterval(sync_server, sync_interval);
    // }

    // show AD
    show_ad();
}