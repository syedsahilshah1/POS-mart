import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f7f8ff',
webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadFile(indexPath);
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

import { ipcMain } from 'electron';

ipcMain.handle('print-receipt', async (event, receiptData) => {
  const { lines, total, paymentMethod, orderId, timestamp } = receiptData;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - Order #${orderId}</title>
  <style>
    @media print {
      body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; max-width: 80mm; }
      .receipt { margin: 0; }
      .header { text-align: center; margin-bottom: 20px; }
      .header h1 { font-size: 20px; margin: 5px 0; }
      .item { display: flex; justify-content: space-between; padding: 2px 0; }
      .item-name { font-size: 14px; }
      .total-line { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
      .footer { margin-top: 20px; text-align: center; font-size: 10px; }
    }
  </style>
</head>
<body onload="window.print(); window.onafterprint = () => window.close();">
  <div class="receipt">
    <div class="header">
      <h1>Kinetic POS Mart</h1>
      <p>POS Mart System</p>
      <p>Date: ${timestamp}</p>
      <p>Order #: ${orderId}</p>
    </div>
    <div class="items">
`;

  lines.forEach(line => {
    html += `
      <div class="item">
        <span class="item-name">${line.name} x${line.qty}</span>
        <span>${Math.round(line.total)}</span>
      </div>
    `;
  });

  html += `
    </div>
    <div class="total-line">
      <span>Total</span>
      <span>${Math.round(total)} PKR</span>
    </div>
    <div class="payment">
      Payment: ${paymentMethod.toUpperCase()}
    </div>
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Kinetic POS Mart</p>
    </div>
  </div>
</body>
</html>`;

  const printWindow = new BrowserWindow({
    width: 300,
    height: 500,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false
    }
  });

  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await printWindow.webContents.print({ silent: false });
  printWindow.close();
});
