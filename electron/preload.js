import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData)
});

