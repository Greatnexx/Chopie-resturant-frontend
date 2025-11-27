import { useState, useRef, useEffect } from 'react';
import { QrCode, X, Camera } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualInput = (tableNumber) => {
    if (tableNumber && tableNumber.trim()) {
      onScanSuccess(tableNumber.trim());
      onClose();
    }
  };

  // Simulate QR code scanning (in real implementation, use a QR library like qr-scanner)
  const simulateQRScan = () => {
    // This would be replaced with actual QR scanning logic
    const mockTableNumber = prompt('Enter table number (simulating QR scan):');
    if (mockTableNumber) {
      handleManualInput(mockTableNumber);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan Table QR Code
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isScanning ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">
              Scan the QR code on your table to automatically select your table number
            </p>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Start Camera
              </button>
              <button
                onClick={simulateQRScan}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Enter Table Number Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 bg-black rounded-lg"
              />
              <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-red-500"></div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Point your camera at the QR code on your table
            </p>
            <div className="space-y-2">
              <button
                onClick={simulateQRScan}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Simulate Scan (Demo)
              </button>
              <button
                onClick={stopCamera}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Stop Camera
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;