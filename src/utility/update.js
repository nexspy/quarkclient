/**
 * Update software automatically
 */
const ipcRenderer = require('electron').ipcRenderer;

// wait for an checkForUpdate message
ipcRenderer.on('checkForUpdate', function(event, text) {
    // changes the text of the button
    btn_update.text('checking for update...');
});

// wait for an updateAvailable message
ipcRenderer.on('updateAvailable', function(event, text) {
    update_count++;

    // update found, so will be updating and thus prevent shutdown
    store.set('app_status', 'updating');
    stt = 'updating';

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


/**
 * Update : 
 */
function update_software() {
    // set to normal
    store.set('app_status', 'normal');
    stt = 'normal';

    ipcRenderer.send('quitAndInstall');
    $(this).hide();
}