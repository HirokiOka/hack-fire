const puppeteer = require('puppeteer');
const { app, BrowserWindow } = require('electron');

const deployUrl = "https://battlehacker.adaptable.app";
const localUrl = "http://localhost:3000";

app.whenReady().then(() => {
  const { screen } = require('electron');
  const displays = screen.getAllDisplays();
  let inputIdx = 1;
  displays.forEach((d, _) => {
    const windowWidth = d.workAreaSize.width;
    const windowHeight = d.workAreaSize.height;
    console.log(d.label);

    if (d.label === 'T101D') {
      const x = d.bounds.x;
      const y = d.bounds.y;
      const inputWindow = new BrowserWindow({
        x, y,
        windowWidth, windowHeight,
        autoHideMenuBar: true
      });
      inputWindow.loadURL(`${deployUrl}/p${inputIdx}_title`);
      inputWindow.setFullScreen(true);
      inputIdx++;
    }

    if (d.label === 'PTFWLD-22W') {
      const x = d.bounds.x;
      const y = d.bounds.y;
      const gameWindow = new BrowserWindow({
        x, y,
        windowWidth, windowHeight,
        autoHideMenuBar: true
      });
      gameWindow.loadURL(`${deployUrl}`);
      gameWindow.setFullScreen(true);
    }

  });
});
