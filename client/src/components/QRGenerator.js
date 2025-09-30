import React, { useState } from 'react';
import axios from 'axios';
import './QRGenerator.css';

const QRGenerator = () => {
  const [qrCodes, setQrCodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const generateQRCodes = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/admin/generate-qr');
      setQrCodes(response.data);
      setMessage('QR codes generated successfully!');
    } catch (error) {
      setMessage('Error generating QR codes: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-generator">
      <div className="container">
        <h1>QR Code Generator</h1>
        <p>Generate daily check-in and check-out QR codes</p>

        <div className="generator-section">
          <button 
            onClick={generateQRCodes}
            disabled={loading}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Today\'s QR Codes'}
          </button>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {qrCodes && (
            <div className="qr-codes-display">
              <h3>Today's QR Codes - {qrCodes.date}</h3>
              
              <div className="qr-codes-grid">
                <div className="qr-code-card">
                  <h4>Check-In QR Code</h4>
                  <div className="qr-image">
                    <img src={qrCodes.checkin.qr} alt="Check-in QR Code" />
                  </div>
                  <p>Scan this QR code to check in</p>
                </div>

                <div className="qr-code-card">
                  <h4>Check-Out QR Code</h4>
                  <div className="qr-image">
                    <img src={qrCodes.checkout.qr} alt="Check-out QR Code" />
                  </div>
                  <p>Scan this QR code to check out</p>
                </div>
              </div>

              <div className="qr-data">
                <h4>QR Code Data (for testing):</h4>
                <div className="data-section">
                  <strong>Check-in Data:</strong>
                  <pre>{qrCodes.checkin.data}</pre>
                </div>
                <div className="data-section">
                  <strong>Check-out Data:</strong>
                  <pre>{qrCodes.checkout.data}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
