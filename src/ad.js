const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote
var log = require('electron-log');

// Data Persistant
const Store = require('electron-store');
const store = new Store();

// time duration of ad opening...
var ad_open_time = 10;

start();



function start() {
    $('.flexslider').hide();

    get_images();

    setup_to_open_timer();
}

function get_images(){
    var url_to_use = get_main_url();
    log.info('getting images..');
    
    var params = new URLSearchParams();

    axios.post(url_to_use + '/shopping/ads', params)
        .then(function (response) {
            log.info('got some response..');
            start_slider(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function start_slider(images) {
    var html = '';

    html += '<ul class="slides">';
    for(var i=0; i<images.length; i++) {
        html += '<li>';
        html += '<img src="' + images[i].image + '" />';
        html += '</li>';
    }
    html += '</ul>';

    $('.wrapper.load').hide();
    $('.flexslider').html(html).show();
    init_slider();
}

function init_slider() {
    // on success init slider
    $('.flexslider').flexslider({
        animation: "slide",
        slideshow: true,
        slideshowSpeed: 2000,
    });
}

/**
 * Get the main url (domain) to use
 */
function get_main_url() {
    // static website
    return 'https://www.cloud9gaminghub.com';
}

/**
 * Open timer.html after 5 seconds
 */
function setup_to_open_timer() {
    setInterval(function() {
        open_timer();
    }, ad_open_time*1000);
}

/**
 * Open Timer window
 */
function open_timer() {
    // make ad page closable
    store.set('ad_can_be_closed', true);

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

// Get monitor/window dimensions
function getWidowDimensions() {
    var screenElectron = require('electron').screen;
    var mainScreen = screenElectron.getPrimaryDisplay();
    var dimensions = mainScreen.size;
    return dimensions;
}