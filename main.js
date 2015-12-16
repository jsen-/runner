'use strict';
const which = require('which');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const kill = require('tree-kill');

let mainWindow;
let argv = process.argv.splice(2);
let processes = [];

function quit() {
    var cmdLine = 'taskkill /T /F /pid ' + processes.map(function(p) { return p.pid; }).join(' /pid ');
    childProcess.exec(cmdLine, function() {
        app.quit();
    });
}

app.on('window-all-closed', function() {
    quit();
    // if (process.platform != 'darwin') {
    //     app.quit();
    // }
});

process.on('SIGINT', function() {
    quit();
});

app.on('ready', function() {
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on('closed', function() {
        mainWindow = undefined;
    });

    which('npm', function(err, npmPath) {
        if(err) {
            throw err;
        }
        ipc.on('init', function onInit(event) {
            argv.forEach(function(arg, index) {
                var proc = processes[index];
                if(proc !== undefined) {
                    kill(proc.pid, 'SIGINT');
                }
                processes[index] = proc = childProcess.exec(npmPath + ' run '+ arg);
                proc.stdout.on('data', function onData(data) {
                    event.sender.send('data', index, data);
                });
            });
        });
    });
});
