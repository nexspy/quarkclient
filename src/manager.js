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

// starting page to display
var starting_page = "people";
// login check
var is_logging_in = false;
// is logged IN
var is_logged_in = false;

// page buttons and forms
var btn_login = $("#btn-login")
var menu_links = $("ul.routes li a")
var btn_close = $("#close-area a");

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
}

menu_links.click(function(e) {
    e.preventDefault();

    var pageId = $(this).attr("page");
    $(".page:visible").fadeOut("fast", function() {
        $("#page-" + pageId).fadeIn();

        handle_page(pageId);
    });
});

btn_close.click(function(e) {
    e.preventDefault();

    let w = remote.getCurrentWindow()
    w.close()
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
        return;
    }

    // api_user_login(info);
})

/**
 * Handle : list of computer page
 * @param {string} pageId 
 */
function handle_page(pageId) {
    switch(pageId) {
        case 'computers':
            var computers = dummy_computers();

            var html = '';
            for (var i=0; i<computers.length; i++) {
                html += render_computer(computers[i]);
            }
            
            $("#page-computers .computers").html(html);

            break;
        case 'transactions':
            var transactions = dummy_transactions();

            var html = render_table(transactions);
            $("#page-transactions .transactions .result-area").html(html);

            break;
        case 'people':
            var people = dummy_people();

            var html = render_people_table(people);
            $("#page-people .people .result-area").html(html);

            break;

    }
}

