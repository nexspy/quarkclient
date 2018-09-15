const {app, BrowserWindow, Menu, ipcMain, Notification} = require('electron')
// const {autoUpdater} = require("electron-updater");
var log = require('electron-log');
const path = require('path')
const url = require('url')
const shell = require('electron').shell

// var mainScreen = screenElectron.getPrimaryDisplay();
// var dimensions = mainScreen.size;

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

// IPC communication
// receives all messages from all processes, and can send to other processes
const ipc = require('electron').ipcMain

// Data Persistant
const Store = require('electron-store');
const store = new Store();
var ready_to_close = false;
store.set('ready_to_close', false);

store.delete('ready_to_close');


function getWidowDimensions() {
  var screenElectron = require('electron').screen;
  var mainScreen = screenElectron.getPrimaryDisplay();
  var dimensions = mainScreen.size;
  return dimensions;
}

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
// autoUpdater.on('update-downloaded', (info) => {
//   log.info('Update Downloaded');
//   win.webContents.send('updateReady')
// });

// // when receiving a quitAndInstall signal, quit and install the new version ;)
// ipcMain.on("quitAndInstall", (event, arg) => {
//   autoUpdater.quitAndInstall();
// })

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  log.info("New Main Window created...");

  var dimen = getWidowDimensions();
  
  // Create the browser window.
  win = new BrowserWindow({
    width: dimen.width,
    height: dimen.height,
    frame: false,
    x:0,
    y:0,
    resizable: false,
    movable: false,
    minimizable: false,
    fullscreen: true,
    icon: __dirname + '/logo.ico',
  });

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'src/index.html'),
    // pathname: path.join(__dirname, 'src/index.html'),
    // pathname: path.join(__dirname, 'src/timer.html'),
    // pathname: path.join(__dirname, 'src/food.html'),
    protocol: 'file:',
    slashes: true
  }))

  // prevent closing of window
  win.on('close', function (event) {
    ready_to_close = store.get('ready_to_close');    
    if (!ready_to_close) {
      event.preventDefault();
    }
  })

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })

  // keep our application always on top
  // set_alwaysonTop();
  win.setFullScreen(true);

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipc.on('update-notify-value', function(event, arg) {
  win.webContents.send('targetPriceVal', arg);

  console.log(arg)

  console.log('closing window now');
  
  callNotify();
});


ipc.on('lock-computer', function(event, arg) {
  createWindow();
});

ipc.on('close-full-app', function(event, arg) {
  app.close();
});

// resets application like a fresh install
function reset_app() {
  store.set('is_registered', 0);
}

function callNotify() {
  if (Notification.isSupported()) {
    const notification = new Notification({ title: 'Title', body: 'I am body!!!'});
    notification.show();
    console.log("notification should be shown now")
  }
}

// sets the application always on top no matter what
function set_alwaysonTop() {
  setInterval(function(){
    if (win) {
      win.setAlwaysOnTop(true);
    }
  }, 1);
}



function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
      return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
      let spawnedProcess, error;

      try {
          spawnedProcess = ChildProcess.spawn(command, args, {
              detached: true
          });
      } catch (error) {}

      return spawnedProcess;
  };

  const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
          // Optionally do things such as:
          // - Add your .exe to the PATH
          // - Write to the registry for things like file associations and
          //   explorer context menus

          // Install desktop and start menu shortcuts
          spawnUpdate(['--createShortcut', exeName]);

          setTimeout(application.quit, 1000);
          return true;

      case '--squirrel-uninstall':
          // Undo anything you did in the --squirrel-install and
          // --squirrel-updated handlers

          // Remove desktop and start menu shortcuts
          spawnUpdate(['--removeShortcut', exeName]);

          setTimeout(application.quit, 1000);
          return true;

      case '--squirrel-obsolete':
          // This is called on the outgoing version of your app before
          // we update to the new version - it's the opposite of
          // --squirrel-updated

          application.quit();
          return true;
  }
};