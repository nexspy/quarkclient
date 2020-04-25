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

// Data Persistant
const Store = require('electron-store');
const store = new Store();

// starting page to display
var starting_page = "computers";
var current_page = starting_page;
// global user
var user = store.get("global_user", false);
// login check
var is_logging_in = false;
// is logged IN
var is_logged_in = false;

// page buttons and forms
var btn_login = $("#btn-login")
var btn_logout = $("#btn-logout")
var menu_links = $("ul.routes li a")
var btn_close = $("#close-area a");
var btn_search_trans = $("#btn-search-trans");

start();

function start() {
    // load page
    $("#page-" + starting_page).fadeIn();
    handle_page(starting_page);

    // start timer for showing correct date
    setInterval(function() {
        var mydate = moment().format("LTS, DD MMMM YYYY");
        $("#current-time").html(mydate);
    }, 1000)

    // flip loader non-stop
    setInterval(function() {
        $(".flip-card").toggleClass("is-hovered");
    }, 1000)

    // load current software version
    var version = electron.remote.app.getVersion();
    $("#current-version").html("v." + version);
}

menu_links.click(function(e) {
    e.preventDefault();

    show_loader();

    var pageId = $(this).attr("page");
    $(".page:visible").fadeOut("fast", function() {
        $("#page-" + pageId).fadeIn();

        current_page = pageId;
        handle_page(pageId);
    });
});

btn_close.click(function(e) {
    e.preventDefault();

    var r = confirm('Do you want to close this application?');
    if (r) {
        let w = remote.getCurrentWindow()
        w.close()
    }
});

btn_login.click(function(e) {
    e.preventDefault();

    is_logging_in = true;
    var info = {
        'username': $("#txt-username").val(),
        'password': $("#txt-password").val(),
    }

    if (validate_user_info(info)) {
        is_logging_in = false;

        show_loader();

        api_server_login(info, handle_user_login_response);
        return;
    }
    
    // api_user_login(info);
});

btn_logout.click(function() {
    user = false;
    store.set("global_user", false);
    render_user_page();
})

btn_search_trans.click(function(e) {
    e.preventDefault();

    var info = {
        'token': 'dssadfasfasdfdsafds',
        'cyber_id' : 1,
        'pin': user.pin,
        'uid': user.uid,
        'date' : $("#txt-trans-search").val()
    };

    show_loader();

    // fetch transactions
    api_get_transactions(info, handle_transactions_response);
});

/**
 * Events : 
 * 
 */
$(".computers").delegate(".computer", "click", function(e) {
    e.preventDefault();

    var machine_id = $(this).attr("cid");
    var m_status = $(this).attr("status");

    if (m_status == 'free') {
        return;
    }
    
    // show_loader();
    var r = confirm("Do you want to stop this computer?");
    var status = (r) ? 'free' : '';
    
    var info = {
        'id': machine_id,
        'status': status,
        'note': '',
        'op': 'update',
        'payment': 0,
        'time': 0
    }
    info = add_uesr_creds(info);

    // do nothing if no status
    if (status.lenght <= 0) {
        return;
    }

    if (status == "free") {
        api_stop_computer(info, handle_stop_computer_response);
    }
});

/**
 * Add user credentials before api call
 * 
 * @param {object} info 
 */
function add_uesr_creds(info) {
    if (!user) {
        return info;
    }

    info.uid = user.uid;
    info.pin = user.pin;
    info.cyber_id = 1; // user.cyber_id;
    return info;
}

function show_loader() {
    $(".loader").show();
    setTimeout(function() { hide_loader(); }, 2000);
}
function hide_loader() {
    $(".loader").hide();
}

/**
 * Handle : list of computer page
 * @param {string} pageId 
 */
function handle_page(pageId) {

    switch(pageId) {
        case 'home':
            render_user_page();

            break;
        case 'computers':
            check_user_to_view_page();
            
            var info = {
                'toke': 'dfasdfdasfdsa',
                'cyber_id': 1,
                'pin': user.pin,
                'uid': user.uid
            };

            // fetch computers every 10 seconds
            api_get_computers(info, handle_computers_response);
            setInterval(function() {
                if (current_page == 'computers') {
                    api_get_computers(info, handle_computers_response);
                }
            }, 10000);

            break;
        case 'transactions':
            check_user_to_view_page();

            var info = {
                'token': 'dssadfasfasdfdsafds',
                'cyber_id' : 1,
                'pin': user.pin,
                'uid': user.uid
            };

            // fetch transactions
            api_get_transactions(info, handle_transactions_response);

            break;
        case 'people':
            check_user_to_view_page();
            
            
            break;

    }
}

/**
 * Prevent user to view pages if not logged in
 */
function check_user_to_view_page() {
    if (!user) {
        alert("You must be logged in to view this section!!");
        go_back_to_home();
        return;
    }
}

/**
 * Redirect any link to homepage
 */
function go_back_to_home() {
    current_page = "home";
    var pageId = current_page;

    $(".page:visible").fadeOut("fast", function() {
        $("#page-" + pageId).fadeIn();

        current_page = pageId;
        handle_page(pageId);
    });
}

/**
 * Handle the user login after logging in
 * @param {object} data 
 */
function handle_user_login_response(data) {
    // do something
    if (data.success) {
        // save user info
        user = data.user;
        store.set("global_user", user);

        var user_pin = data.user.pin;
        // 
        $(".form-server").fadeIn("fast", function() {
            render_user_page();
        });
    } else {
        console.log(data.message);
    }
}

/**
 * Render user page, if user data exists
 */
function render_user_page() {
    if (user) {
        $(".form-server").show();
        $(".form").slideUp();
        $(".form-server h2 span").text(user.name);
        $(".form-server .your-pin span").text(user.pin);
    } else {
        $(".form-server").hide();
        $(".form").show();
    }
}

/**
 * Handle response from api call to getting transactions
 * 
 * @param {object} data 
 */
function handle_transactions_response(data) {
    var transactions = data.activity;
    var html = render_table(transactions);
    $("#page-transactions .transactions .result-area").html(html);
}

/**
 * Handle response from api call to getting computers
 * @param {object} data 
 */
function handle_computers_response(data) {
    var html = '';
    for (var i=0; i<data.computers.length; i++) {
        html += render_computer(data.computers[i]);
    }
    
    $("#page-computers .computers").html(html);
}

/**
 * Handle response from api after computer is stopped
 * 
 * @param {object} data 
 */
function handle_stop_computer_response(data) {
}