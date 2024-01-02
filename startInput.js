const puppeteer = require('puppeteer');
const { app, BrowserWindow, screen } = require('electron');

const deployUrl = 'https://battlehacker.adaptable.app/p1_title';

app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const inputWindow = new BrowserWindow({
    width, height,
    autoHideMenuBar: true, 
  });
  inputWindow.loadURL(deployUrl);
  inputWindow.setFullScreen(true);
});
