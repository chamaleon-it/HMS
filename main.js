const { app, BrowserWindow } = require('electron');
const path = require('path');
const fp = require('find-free-port');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;
let mainWindow;
let serverProcess;

const startServer = async () => {
    if (isDev) {
        // In dev, we assume the user is running 'next dev' separately or we can spawn it.
        // Ideally checking if port 3000 is open.
        console.log("Running in dev mode. Connecting to localhost:3000");
        return 'http://localhost:3000';
    }

    try {
        const [port] = await fp(3000);
        console.log(`Starting local server on port ${port}`);

        // In production, we expect the standalone folder to be bundled
        // We will configure electron-builder to put contents of .next/standalone into a folder named 'app_server'
        // inside the resources directory.
        // process.resourcesPath is where 'app.asar' lives.
        const serverPath = path.join(process.resourcesPath, 'app_server', 'server.js');

        console.log('Server path:', serverPath);

        serverProcess = spawn('node', [serverPath], {
            env: {
                ...process.env,
                PORT: port,
                HOSTNAME: '127.0.0.1',
                NODE_ENV: 'production'
            },
            cwd: path.dirname(serverPath)
        });

        serverProcess.stdout.on('data', (data) => console.log(`Next Server: ${data}`));
        serverProcess.stderr.on('data', (data) => console.error(`Next Server Err: ${data}`));

        serverProcess.on('close', (code) => {
            console.log(`Next Server exited with code ${code}`);
        });

        // Give it a moment to spin up
        // Better way: poll the port or wait for a specific log output.
        // For simplicity, a small delay + retry logic in loadURL could work, but let's just wait 2s.
        await new Promise(resolve => setTimeout(resolve, 2000));

        return `http://localhost:${port}`;

    } catch (err) {
        console.error('Failed to start server:', err);
        throw err;
    }
};

const createWindow = async () => {
    try {
        const url = await startServer();

        mainWindow = new BrowserWindow({
            width: 1280,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
        });

        console.log(`Loading URL: ${url}`);
        mainWindow.loadURL(url);

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    } catch (e) {
        console.error('Error creating window:', e);
    }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (serverProcess) {
        console.log('Killing server process...');
        serverProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
