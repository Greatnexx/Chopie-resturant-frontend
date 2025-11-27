import { useState } from 'react';
import { QrCode, Download, Printer } from 'lucide-react';

const QRGenerator = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    if (!tableNumber.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Create QR code data - this should contain table info
      const qrData = JSON.stringify({
        type: 'table',
        tableNumber: tableNumber.trim(),
        restaurant: 'Your Restaurant Name',
        timestamp: new Date().toISOString()
      });
      
      // Using QR Server API (free service)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-${tableNumber}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const printQRCode = () => {
    if (!qrCodeUrl) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${tableNumber} QR Code</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .qr-container { 
              border: 2px solid #000; 
              padding: 20px; 
              display: inline-block; 
              margin: 20px;
            }
            h1 { margin-bottom: 10px; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Table ${tableNumber}</h1>
            <img src="${qrCodeUrl}" alt="Table ${tableNumber} QR Code" />
            <p>Scan to order</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <QrCode className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-semibold">Generate Table QR Codes</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table Number
          </label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Enter table number (e.g., 1, 2, A1, B2)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <button
          onClick={generateQRCode}
          disabled={!tableNumber.trim() || isGenerating}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </button>

        {qrCodeUrl && (
          <div className="mt-6 text-center">
            <div className="border-2 border-gray-200 rounded-lg p-4 inline-block">
              <h3 className="text-lg font-semibold mb-2">Table {tableNumber}</h3>
              <img 
                src={qrCodeUrl} 
                alt={`Table ${tableNumber} QR Code`}
                className="mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">Scan to order</p>
            </div>
            
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={printQRCode}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;