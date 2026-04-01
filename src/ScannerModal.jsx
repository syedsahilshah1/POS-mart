import { useEffect, useRef, useCallback, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ScannerModal = ({ isOpen, onScan, onClose }) => {
  const containerRef = useRef(null);
  const qrCodeRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const getCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      } else {
        setErrorMsg('No cameras found');
      }
    } catch (err) {
      setErrorMsg('Camera permission denied or not supported');
    }
  }, []);

  const startScan = useCallback(async (cameraId) => {
    if (!containerRef.current || !cameraId) return;
    if (qrCodeRef.current) {
      try { await qrCodeRef.current.stop(); } catch(e) {}
      qrCodeRef.current = null;
    }

    try {
      setErrorMsg(null);
      const html5QrCode = new Html5Qrcode(containerRef.current);
      qrCodeRef.current = html5QrCode;
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          onScan(decodedText);
          html5QrCode.stop().then(() => {
            qrCodeRef.current = null;
            onClose();
          }).catch(console.error);
        },
        (error) => console.warn('Scan error:', error)
      );
    } catch (err) {
      console.error('Camera init failed:', err);
      setErrorMsg('Initialization failed: ' + err.message);
    }
  }, [onScan, onClose]);

  useEffect(() => {
    if (isOpen) {
      getCameras();
    }
    return () => {
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(console.error);
        qrCodeRef.current = null;
      }
    };
  }, [isOpen, getCameras]);

  useEffect(() => {
    if (isOpen && selectedCamera) {
      startScan(selectedCamera);
    }
  }, [isOpen, selectedCamera, startScan]);

  if (!isOpen) return null;

  const handleMockScan = () => {
    onScan('bread-artisan');
    onClose();
  };

  return (
    <div className="scanner-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()} style={{ overflow: 'hidden' }}>
        <div className="scanner-header" style={{ borderBottom: '1px solid #eee' }}>
          <h3>📷 Scanner</h3>
          <button onClick={onClose} className="text-btn">Close</button>
        </div>
        
        {errorMsg && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#e53e3e', background: '#fff' }}>
            <p style={{marginBottom: '10px'}}>{errorMsg}</p>
            <button 
              onClick={handleMockScan} 
              style={{ background: '#10b565', color: '#fff', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Simulate Scan (Artisan Bread)
            </button>
          </div>
        )}

        <div ref={containerRef} className="scanner-reader" style={{ background: '#000', minHeight: '300px' }} />
        
        <div style={{ padding: '20px', background: '#fff' }}>
          {cameras.length > 1 && (
            <select 
              className="search-box" style={{ width: '100%', marginBottom: '12px', padding: '10px' }}
              value={selectedCamera} onChange={e => setSelectedCamera(e.target.value)}
            >
              {cameras.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          )}
          <p className="scanner-hint" style={{ fontSize: '13px', color: '#73839e' }}>
            Point your camera at a product QR code or Barcode.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
