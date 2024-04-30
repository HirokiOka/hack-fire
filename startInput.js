const { app, BrowserWindow, screen } = require('electron');

//const deployUrl = 'http://slash-shot.adaptable.app/p1_title';
const deployUrl = 'https://battlehacker.adaptable.app/p1_title';
//const deployUrl = 'dummy';

app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const inputWindow = new BrowserWindow({
    width, height,
    autoHideMenuBar: true, 
  });

  function loadUrlWithRetry(url, attempts = 0) {
    inputWindow.loadURL(deployUrl)
      .then(() => {
        inputWindow.setFullScreen(true);
      })
      .catch((err) => {
        console.error('Error loading URL: ', err);
        if (attempts < 3) {
          setTimeout(() => loadUrlWithRetry(url, attempts + 1), 5000);
        } else {
          inputWindow.loadFile('error.html');
        }
    });
  }

  loadUrlWithRetry(deployUrl);

  inputWindow.on('closed', () => {
    app.quit();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});


