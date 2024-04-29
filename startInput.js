const { app, BrowserWindow, screen } = require('electron');

//const deployUrl = 'http://slash-shot.adaptable.app/p1_title';
const deployUrl = 'https://battlehacker.adaptable.app/p1_title';

app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const inputWindow = new BrowserWindow({
    width, height,
    autoHideMenuBar: true, 
  });
  inputWindow.loadURL(deployUrl)
    .then(() => {
      inputWindow.setFullScreen(true);
    })
    .catch((error) => {
      console.error('Error loading URL: ', error);
      inputWindow.loadFile('error.html');
    });

  inputWindow.on('closed', () => {
    app.quit();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
