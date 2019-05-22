const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote
const ipcRenderer = require('electron').ipcRenderer;
const shutdown = require('electron-shutdown-command');
var log = require('electron-log');

// code to reset
const reset_username = 'reset';
const reset_password = '1987';
const close_username = 'endme';
const close_password = '1987';

var url_status = '/machine/status';
var url_register_code = '/machine/register';
var url_server_mac = '/machine/install';
var url_login = '/cyber/authenitcate';
var url_access = '/cyber/request';

// Data Persistant
const Store = require('electron-store');
const store = new Store();

var body = $("body");
var btn_request = $("#btn_request");
var btn_login = $("#user_login");
var btn_reset= $("#btn_reset");
var btn_register = $("#register");
var btn_install = $("#startapp");
var btn_nightmode = $('.night-btn');
var btn_update_now = $('#btn-update-now');
var btn_update = $('.btn-update-app');
var txt_user = $("#txt_username");
var txt_pass = $("#txt_password");
var txt_all = $("#txt_username, #txt_password");
var check_dev_mode = $("#dev_mode");
var controls_dev_mode = $("#controls");

var app_basekey = store.get("app_basekey", "");
var username_last = store.get('username');
txt_user.val(username_last);
var is_registered_x = store.get('is_registered_x');
var ready_to_close = store.get('ready_to_close');
var run_mode = store.get("run_mode");
var stop_request_login = false;
var stop_register_btn = false;
var nightmode = store.get('nightmode');
// use this flag to see for application being updated.
var stt = 'normal';
var update_count = 0;


// 
startup();

// wait for an checkForUpdate message
ipcRenderer.on('checkForUpdate', function(event, text) {
    // changes the text of the button
    btn_update.text('checking for update...');
});

// wait for an updateAvailable message
ipcRenderer.on('updateAvailable', function(event, text) {
    update_count++;

    // changes the text of the button
    btn_update.text('update found!');
});

// wait for an noUpdateAvailable message
ipcRenderer.on('noUpdateAvailable', function(event, text) {
    // changes the text of the button
    btn_update.text('no updates found!');
});

// update download progress
ipcRenderer.on('update_progress', function(event, message) {
    // block shutting down
    if (stt == 'normal') {
        store.set('app_status', 'updating');
        stt = 'updating';
    }
    // var width = $("#progress-update").width();
    // var percentage = parseInt(percentage);
    // var new_width = (percentage/100) * width;
    // progress_bar.width(new_width);
    btn_update.text(message);
});

// wait for an updateDownloaded message
ipcRenderer.on('updateDownloaded', function(event, text) {
    update_count++;
    // changes the text of the button
    btn_update.text('update download completed and ready to install!!!!');
    btn_update_now.show();
});

// update now
btn_update_now.click(function(e) {
    e.preventDefault();

    // set to normal
    store.set('app_status', 'normal');
    stt = 'normal';

    ipcRenderer.send('quitAndInstall');
    $(this).hide();
});


body.click(function() {
    $("#form-wrapper").show();
})

btn_register.click(function(e) {
    e.preventDefault();
    var basekey = $("#txt_basekey").val();
    var code = $("#txt_code").val();
    // $(this).prop('disabled', true);

    // save the basekey
    store.set("app_basekey", basekey);

    
    request_registration(code);
});

btn_install.click(function(e) {
    e.preventDefault();

    var mac = store.get("my_mac_address", '');

    if (mac.length) {
        post_install(mac);
    }
});

// nightmode shutsdown the software
btn_nightmode.click(function(e) {
    e.preventDefault();

    // ready to close must be set
    store.set('ready_to_close', true);

    var window = remote.getCurrentWindow();
    window.close();
});

// request to login
btn_login.click(function(e) {
    e.preventDefault();

    handle_user_login();
});


// request for opening the computer
btn_request.click(function(e) {
    request_access();
})

txt_pass.keyup(function(e){
    if(e.keyCode == 13)
    {
        handle_user_login();
    }
});


// handle username and password
function handle_user_login() {
    var username = txt_user.val();
    var password = txt_pass.val();

    if (stop_request_login) {
        return;
    }
    stop_request_login = true;

    if (username == reset_username && password == reset_password) {
        reset();
        startup();
    } if (username == close_username && password == close_password) {
        ready_to_close = true;
        store.set('ready_to_close', true);  
    } else {
        if (username.length > 0 && password.length > 0) {
            request_login(username, password);
        } else {
            stop_request_login = false;
        }
    }
}



// resets the whole application (Be Careful)
btn_reset.click(function() {
    reset();
    startup();
});

txt_all.focus(function() {
    $("#message").html('');
});

// check for turn off signal from server
function getStatus() {

    console.log('status check...');
    var registration_code = store.get('registration_code');

    var params = new URLSearchParams();
    params.append('code', registration_code);

    var url_to_use = get_main_url();
    
    axios.post(url_to_use + url_status, params)
        .then(function (response) {
            if (response.data.success) {
                // check to show or hide night mode
                var opening_time = parseInt(response.data.opening_time);
                var closing_time = parseInt(response.data.closing_time);
                
                var server_hour = parseInt(response.data.server_hour);
                // night time
                if (server_hour > closing_time || server_hour < opening_time) {
                    btn_nightmode.show();
                    console.log('ok')
                } else
                // morning time
                if (server_hour < opening_time) {
                    btn_nightmode.show();
                    console.log(server_hour + ' donek ' + opening_time)
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

/**
 * Get the main url (domain) to use
 */
function get_main_url() {

    // static website
    return 'http://quark.modificationdharan.com';

    // new update uses the base key for url
    app_basekey = store.get("app_basekey", "");
    var is_url = valid_url(app_basekey);
    
    if (!is_url) {
        return "";
    }

    return 'http://' + app_basekey;
}

/**
 * Validate a string if it is url
 */
function valid_url(str) {
    return true;

    var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if(!regex .test(str)) {
      alert("Please enter valid URL.");
      return false;
    } else {
      return true;
    }
  }

/**
 * Open the timer window, it shows time remaining and other
 */
function openTimerWindow() {
    const modalPath = path.join('file://', __dirname, 'timer.html')
    var dimen = getWidowDimensions();

    let win = new BrowserWindow({
        width: 240,
        height: dimen.height,
        frame: false,
        x: dimen.width - 240,
        // x:0,
        y:0,
        resizable: false,
        movable: false,
        minimizable: false,
        icon: __dirname + '/../logo.ico',
    })
    
    // win.on('close', function() {
    //     win = null
    // })

    // prevent closing of window
    win.on('close', function (event) {
        event.preventDefault();
    })
    win.on('closed', () => {
        win = null
    })
    win.loadURL(modalPath)
    // win.webContents.openDevTools()
    win.show()

    var window = remote.getCurrentWindow();
    window.close();
}

/** Send Request to open computer */
function request_access() {
    var url_to_use = get_main_url();

    var registration_code = store.get('registration_code');
    btn_request.prop('disabled', true);
    $("#message").html('');
    
    var params = new URLSearchParams();
    params.append('registration_code', registration_code);

    axios.post(url_to_use + url_access, params)
        .then(function (response) {
            if (response.data.success) {
                // time elapsed if nonmember
                var time = response.data.time;

                if (time > 0) {
                    store.set('main_url', url_to_use);
                    store.set('user_id', 0);
                    store.set('user_balance', time);
                    
                    var login_type = 'nonmember';
                    store.set('login_type', login_type);
                    store.set('ready_to_close', true);
                    
                    openTimerWindow();
                } else {
                    console.log('request was denied');
                    var msg = 'request was denied';
                    $("#message").html(msg);
                }

                txt_pass.val('');
                
            } else {
                console.log('request was denied');
                var msg = 'request was denied';
                $("#message").html(msg);
                txt_pass.val('');
            }
            btn_request.prop('disabled', false);
            
        })
        .catch(function (error) {
            console.log(error);

            btn_request.prop('disabled', false);
            console.log('request was denied');
            var msg = 'request was denied';
            $("#message").html(msg);
        });
}

/**
 * Check if username and password are correct, then login
 * @param {*string} username 
 * @param {*string} password 
 */
function request_login(username, password) {
    var pass = false;
    var registration_code = store.get('registration_code');

    var params = new URLSearchParams();
    params.append('uname', username);
    params.append('pcode', password);
    params.append('registration_code', registration_code);

    var url_to_use = get_main_url();

    axios.post(url_to_use + url_login, params)
        .then(function (response) {
            // store username
            store.set('username', username);

            if (response.data.success) {
                // time is the balance left of user
                var time = response.data.user.balance;

                if (time > 0) {
                    store.set('main_url', url_to_use);
                    store.set('user_balance', time);
                    store.set('user_id', response.data.user.user_id);
                    store.set('login_type', 'member');
                    store.set('ready_to_close', true);
                
                    openTimerWindow();
                } else {
                    console.log('insufficient balance');
                    var msg = 'Your balance is low, please contact at the counter desk.';
                    $("#message").html(msg);
                    stop_request_login = false;
                }

                txt_pass.val('');
                
            } else {
                console.log(msg);
                var msg = response.data.message;
                $("#message").html(msg);
                txt_pass.val('');
                stop_request_login = false;
            }
            
        })
        .catch(function (error) {
            console.log(error);

            console.log('username or password was wrong');
            var msg = 'username or password was wrong';
            $("#message").html(msg);
        });
}



// Get monitor/window dimensions
function getWidowDimensions() {
    var screenElectron = require('electron').screen;
    var mainScreen = screenElectron.getPrimaryDisplay();
    var dimensions = mainScreen.size;
    return dimensions;
}

/**
 *  Check registration offline
 */
function request_registration(code) {
    $(".form-box").hide();
    $(".registration").show();

    // do post request
    validate_registration(code);
}

/**
 * Check registration code 
 * @param {*string} code 
 */
function validate_registration(code) {

    if (stop_register_btn) {
        console.log('i have to stop you')
        return;
    }
    stop_register_btn = true;

    var params = new URLSearchParams();
    params.append('code', code);

    var url_to_use = get_main_url();
    
    axios.post(url_to_use + url_register_code, params)
        .then(function (response) {

            stop_register_btn = false;
            
            console.log(response.data);
            if (response.data.success) {
                $(".form-box").hide();
                $(".login-form").show();

                // save registration
                store.set('registration_code', code);
                store.set('cyber_id', response.data.cyber_id);
                store.set('is_registered_x', 1);
                store.set('automatic_shutdown', response.data.automatic_shutdown);
                store.set('opening_time', response.data.opening_time);
                store.set('closing_time', response.data.closing_time);

            } else {
                $("#registration-message").html("Wrong Registration Code");
            }
            
            btn_register.prop('disabled', false);
        })
        .catch(function (error) {
            console.log(error);
            btn_register.prop('disabled', false);
        });
}

/**
 * Install : send mac address to server and get registration code, this registration code is used next time.
 * 
 * @param {string} mac 
 */
function post_install(mac) {
    if (stop_register_btn) {
        console.log('i have to stop you')
        return;
    }
    stop_register_btn = true;

    // show message
    $("#registration-message").html("Installation on progress...");

    var params = new URLSearchParams();
    params.append('xmac', mac);

    var url_to_use = get_main_url();
    
    axios.post(url_to_use + url_server_mac, params)
        .then(function (response) {

            stop_register_btn = false;
            
            console.log(response.data);
            if (response.data.success) {

                var code = response.data.machine.registration_id;
                
                $(".form-box").hide();
                $(".login-form").show();

                // save
                store.set('is_registered_x', 1);
                store.set('registration_code', code);

                // save registration
                // store.set('cyber_id', response.data.cyber_id);
                // store.set('is_registered_x', 1);
                // store.set('automatic_shutdown', response.data.automatic_shutdown);
                // store.set('opening_time', response.data.opening_time);
                // store.set('closing_time', response.data.closing_time);

            } else {
                $("#registration-message").html("Wrong Registration Code");
            }
            
            btn_install.prop('disabled', false);
        })
        .catch(function (error) {
            console.log(error);
            btn_install.prop('disabled', false);
            stop_register_btn = false;
        });
}




// Handle startup actions
function startup() {
    $(".form-box").hide();
    $(".registration").show();

    // client software requires to be registered
    if (is_registered_x) {
        $(".form-box").hide();
        $(".login-form").show();
    } else {
        $(".registration").show();
    }

    // set basekey input
    $("#txt_basekey").val(app_basekey);

    // check status and show night mode
    getStatus();

    // change background image
    // $('body').css('background', 'url(https://picsum.photos/id/1031/300/140) 50% 50% #16191e no-repeat');

    // start timer that shuts down computer after 45 seconds
    setInterval(function(){
        stt = store.get('app_status');
        if (stt !== 'updating') {
            shutdown.shutdown();
        }
    }, 45*1000);

    var appVersion = require('electron').remote.app.getVersion();
    $('.appversion').text('version ' + appVersion);
}


// reset
function reset() {
    is_registered_x = 0;
    store.set('is_registered_x', 0);
}