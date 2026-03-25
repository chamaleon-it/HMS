const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');
const fp = require('find-free-port');
const os = require('os');
const fs = require('fs');

ipcMain.on('print-preview', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    try {
        const pdfData = await win.webContents.printToPDF({
            printBackground: true,
            // margins can be added here if needed
        });
        const pdfPath = path.join(os.tmpdir(), `print-preview-${Date.now()}.pdf`);
        fs.writeFileSync(pdfPath, pdfData);
        
        const previewWin = new BrowserWindow({
            width: 1024,
            height: 768,
            title: 'Print Preview',
            autoHideMenuBar: true,
            webPreferences: {
                plugins: true // Enables Chrome's built-in PDF viewer
            }
        });
        previewWin.setMenu(null);
        previewWin.loadURL(`file://${pdfPath}`);
        
        previewWin.on('closed', () => {
            try {
                fs.unlinkSync(pdfPath);
            } catch (e) {
                // Ignore cleanup errors
            }
        });
    } catch (error) {
        console.error('Failed to generate preview:', error);
    }
});

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

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            window.print = function() {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('print-preview');
            };
        `);
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
