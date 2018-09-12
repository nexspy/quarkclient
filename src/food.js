const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const remote = electron.remote
const shutdown = require('electron-shutdown-command');

// ipc that sends message to main.js
const ipc = electron.ipcRenderer

// Data Persistant
const Store = require('electron-store');
const store = new Store();