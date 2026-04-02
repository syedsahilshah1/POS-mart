import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
// Icon component copied from App.jsx for independence
const Icon = ({ name, className = "" }) => {
  const size = 20;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className
  };
  

  if (name === "chevron") {
    return (
      <svg {...common}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    );
  }

  return null;
};

const ScannerModal = ({ isOpen, onScan, onClose }) => {
  const scannerContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = scannerContainerRef.current;
    if (!container) return;

    let html5QrCode;
    let isScanning = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(container);
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isScanning) {
              onScan(decodedText);
              isScanning = false;
            }
          },
          (error) => {
            console.warn(`Scan error: ${error}`);
          }
        );
      } catch (err) {
        console.error('Scanner init error:', err);
      }
    };

    startScanner();

    return () => {
      isScanning = false;
      if (html5QrCode) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="scanner-modal-overlay">
      <div className="scanner-modal">
        <div className="scanner-header">
          <h3>Scan Product Barcode</h3>
          <button onClick={onClose} className="text-btn">
            <Icon name="chevron" />
          </button>
        </div>
        <div ref={scannerContainerRef} className="scanner-reader" />
        <p className="scanner-hint">USB scanner preferred. Camera for testing (grant permission). Scan product ID e.g. milk-1l</p>
      </div>
    </div>
  );
};

export default ScannerModal;

