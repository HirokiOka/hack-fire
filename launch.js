const puppeteer = require('puppeteer');
const { app, BrowserWindow } = require('electron');

const deployUrl = "https://battlehacker.adaptable.app";
const localUrl = "http://localhost:3000";

app.whenReady().then(() => {
  const { screen } = require('electron');
  const displays = screen.getAllDisplays();
  displays.forEach((d, _) => {
    const windowWidth = d.workAreaSize.width;
    const windowHeight = d.workAreaSize.height;
    console.log(d.label);

    //Input Interface
    if (d.label === 'T101D') {
      const x = d.bounds.x;
      const y = d.bounds.y;
      const displayIndex = x < 0 ? 1 : 2;
      const inputWindow = new BrowserWindow({
        x, y,
        windowWidth, windowHeight,
        autoHideMenuBar: true
      });
      inputWindow.loadURL(`${deployUrl}/p${displayIndex}_title`);
      inputWindow.setFullScreen(true);
    }

    //Game Display
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
