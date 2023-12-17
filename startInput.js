const puppeteer = require('puppeteer');
const { app, BrowserWindow } = require('electron');

const deployUrl = 'https://battlehacker.adaptable.app/p1_title';

app.whenReady().then(() => {
  const { screen } = require('electron');
  const display = screen.getPrimaryDisplay();
  const inputWindow = new BrowserWindow({ display.bounds.x, display.bounds.y, display.bounds.width, display.bounds.height, autoHideMenuBar: true });
  inputWindow.loadURL(deployUrl);
  inputWindow.setFullScreen(true);
});
