/**
 * All window related functions
 */

/**
 * Open a new window based on info passed. 
 * 
 * info : 
 *   - filepath                     : string
 *   - canClose                     : bool
 *   - showDev                      : bool
 *   - width                        : int
 *   - height                       : int
 *   - x                            : int
 *   - isFullscreen                 : bool
 *   - isAlwaysOnTop                : bool
 *   - closeParent                  : bool
 * 
 * @param {object} info 
 */
function open_window(info) {
    win = new BrowserWindow({
        width: info.width,
        height: info.height,
        frame: false,
        x: info.x,
        y: 0,
        resizable: false,
        movable: false,
        minimizable: false,
        icon: __dirname + '/../logo.ico',
    })
    
    win.loadURL(url.format({
        pathname: path.join(__dirname, info.filepath),
        protocol: 'file:',
        slashes: true
    }));

    // prevent closing of window
    win.on('close', function (event) {
        if (typeof info.canClose !== "undefined" && !info.canClose) {
            console.log('attemp to close');
            event.preventDefault();
        }
    });

    if (typeof info.showDev !== "undefined" && info.showDev) {
        win.webContents.openDevTools()
    }

    win.on('closed', () => {
        win = null
    });
    
    // win.show()
    if (typeof info.isFullscreen !== "undefined" && info.isFullscreen) {
        win.setFullScreen(true);
    }

    // always on top
    if (typeof info.isAlwaysOnTop !== "undefined" && info.isAlwaysOnTop) {
        win.setAlwaysOnTop(true);
    }

    // close parent window
    if (typeof info.closeParent !== "undefined" && info.closeParent) {
        var main_window = remote.getCurrentWindow();
        main_window.close();
    }
}

/**
 * Get monitor/window dimensions
 */
function getWidowDimensions() {
    var screenElectron = require('electron').screen;
    var mainScreen = screenElectron.getPrimaryDisplay();
    var dimensions = mainScreen.size;
    return dimensions;
}

/**
 * Open the main lockscreen window
 */
function shutdownComputer() {
    
    store.delete('ready_to_close');

    log.info('computer will now shutdown...');

    stop_sync = true;

    log.info('shutdown');

    if (!isDev) {
        // shutdown computer immediately
        shutdown.shutdown();
    } else {
        // only close the app for development
        var window = remote.getCurrentWindow();
        window.close();
    }

    return;
}