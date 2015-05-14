var app = require("app");
var BrowserWindow = require("browser-window");
var windowStateKeeper = require('./browser/window_state');

require("crash-reporter").start();

var mainWindow = null;

app.on("window-all-closed", function () {
  if (process.platform != "darwin") {
    app.quit();
  }
});

function createWindow() {
  // Preserver of the window size and position between app launches.
  var mainWindowState = windowStateKeeper('main', {
    width: 1000,
    height: 600
  });

  mainWindow = new BrowserWindow({
    title: "GReader",
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    "min-width": 800,
    "min-height": 300
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadUrl("file://" + __dirname + "/render/index.html");

  // save state before close
  mainWindow.on('close', function () {
    mainWindowState.saveState(mainWindow);
  });

  // defer mainWindow
  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  // open url in default browser
  mainWindow.webContents.on("will-navigate", function (event, url) {
    if(!url.startsWith("file://")) {
      event.preventDefault();
      require("shell").openExternal(url);
    } else {
      console.log("file");
    }
  });

  var template = [
    {
      label: 'ReadmeReader',
      submenu: [
        {
          label: 'Services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide',
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() { app.quit(); }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: function() { BrowserWindow.getFocusedWindow().reloadIgnoringCache(); }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+Command+I',
          click: function() { BrowserWindow.getFocusedWindow().toggleDevTools(); }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        }
      ]
    },
    {
      label: 'Help',
      submenu: []
    }
  ];
  var Menu = require("menu");
  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


app.on("ready", function () {
  createWindow();
});

app.on("activate-with-no-open-windows", function () {
  createWindow();
});
