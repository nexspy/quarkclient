const electron = require('electron')
const path = require('path')
const url = require('url')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote
const ipcRenderer = require('electron').ipcRenderer;
const shutdown = require('electron-shutdown-command');
const isDev = require('electron-is-dev');
var log = require('electron-log');

// code to reset
const reset_username = 'reset';
const reset_password = '1984';
const close_username = 'removeme';
const close_password = '1984';

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
store.set('app_status', 'normal');
var update_count = 0;

// choose to show AD page first
var show_ad_page_first = true;

let win;


// store.set("app_activities", []);
var daaa = get_offline_data();
console.log(daaa);

// 
startup();


// update now
btn_update_now.click(function(e) {
    e.preventDefault();

    // do nothing
    return;

    // update the software
    update_software();
});


body.click(function() {
    $("#form-wrapper").show();
});

btn_install.click(function(e) {
    e.preventDefault();

    var mac = store.get("my_mac_address", '');

    if (mac.length) {
        // post_install(mac);
        api_install(mac);
    }
});

// nightmode shutsdown the software
btn_nightmode.click(function(e) {
    e.preventDefault();

    // ready to close must be set
    store.set('ready_to_close', true);

    // close the window
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
    // do nothing
    // request_access();
})

txt_pass.keyup(function(e){
    if(e.keyCode == 13)
    {
        handle_user_login();
    }
});

// resets the whole application (Be Careful)
btn_reset.click(function() {
    reset();
    startup();
});

txt_all.focus(function() {
    $("#message").html('');
});


// handle username and password
function handle_user_login() {
    var username = txt_user.val();
    var password = txt_pass.val();

    var info = {
        'username' : username,
        'password' : password
    };

    // check username and password are entered
    if (!validate_user_info(info)) {
        save_activity('login', 'empty username and password was entered : ' + info.username + ', ' + info.password);
        return;
    }

    if (stop_request_login) {
        return;
    }
    stop_request_login = true;
    btn_login.prop('disabled', true);

    // check for resetting of software
    if (validate_reset(info)) {
        save_activity('reset', 'software was reset');
        reset();
        startup();
    } if (validate_immediate_close(info)) {
        save_activity('reset', 'software was forced to shutdown immediately');
        ready_to_close = true;
        store.set('ready_to_close', true);
    } else {
        // good to check for user now
        api_user_login(info);
        btn_login.val('logging in....');
    }
}

// Handle startup actions
function startup() {
    $(".form-box").hide();
    $(".registration").show();

    // client software requires to be registered
    if (is_registered_x) {
        $(".form-box").hide();
        $(".login-form").show();
        // show login 
        $("#form-wrapper").show();
    } else {
        $(".registration").show();
    }

    // set basekey input
    $("#txt_basekey").val(app_basekey);

    // check status and show night mode
    api_check_status();

    // change background image
    // $('body').css('background', 'url(https://picsum.photos/id/1031/300/140) 50% 50% #16191e no-repeat');

    // start timer that shuts down computer after 45 seconds
    setInterval(function(){
        stt = store.get('app_status');
        if (stt !== 'updating' && isDev == false) {
            shutdown.shutdown();
        }
    }, 45*1000);

    var appVersion = require('electron').remote.app.getVersion();
    $('.appversion').text('version ' + appVersion);


    
    setTimeout(function() {
        var vid = document.getElementById("home-video");
        vid.play();
    }, 1000);
}

// reset
function reset() {
    is_registered_x = 0;
    store.set('is_registered_x', 0);
}