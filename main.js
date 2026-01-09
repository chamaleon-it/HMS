const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');
const fp = require('find-free-port');

async function createWindow() {
    const [port] = await fp(3000);

    // Start local server
    const server = http.createServer((request, response) => {
        return handler(request, response, {
            public: path.join(__dirname, 'out'),
            cleanUrls: true
        });
    });

    server.listen(port, () => {
        console.log('Running at http://localhost:' + port);
    });

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    const startUrl =
        process.env.ELECTRON_START_URL ||
        `http://localhost:${port}`;

    mainWindow.loadURL(startUrl);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
