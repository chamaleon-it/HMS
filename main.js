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

    mainWindow.maximize();

    const startUrl =
        process.env.ELECTRON_START_URL ||
        `http://localhost:${port}`;

    mainWindow.loadURL(startUrl);

    // Handle child windows for pharmacy orders to ensure they stay on top
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes('/dashboard/pharmacy/new-order')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    alwaysOnTop: true,
                    // Keep the same webPreferences as main window
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false
                    }
                }
            };
        }
        return { action: 'allow' };
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
