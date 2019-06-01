const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote
var log = require('electron-log');

// Data Persistant
const Store = require('electron-store');
const store = new Store();

start();



function start() {
    $('.flexslider').hide();

    get_images();
}

function get_images(){
    var url_to_use = get_main_url();
    log.info('getting images..');
    
    var params = new URLSearchParams();

    axios.post(url_to_use + '/cyber/ad/page', params)
        .then(function (response) {
            log.info('got some response..');
            if (response.data.success) {
                
                start_slider(response.data.images);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function start_slider(images) {
    var html = '';

    var url_to_use = get_main_url();

    html += '<ul class="slides">';
    for(var i=0; i<images.length; i++) {
        html += '<li>';
        html += '<img src="' + images[i] + '" />';
        html += '</li>';
    }
    html += '</ul>';

    $('.wrapper').hide();
    $('.flexslider').html(html).show();
    init_slider();
}

function init_slider() {
    // on success init slider
    $('.flexslider').flexslider({
        animation: "slide",
        slideshow: true,
        slideshowSpeed: 4000,
    });
}

/**
 * Get the main url (domain) to use
 */
function get_main_url() {
    // static website
    return 'http://quark.modificationdharan.com';
}