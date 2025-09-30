import React, { useState } from 'react';
import axios from 'axios';
import './AttendanceScanner.css';

const AttendanceScanner = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setName] = useState('');
  const [qrData, setQrData] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async (type) => {
    if (!employeeId.trim() || !employeeName.trim()) {
      setMessage('Please enter both Employee ID and Name');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Simulate QR scan - in real app, this would come from QR scanner
      const today = new Date().toISOString().split('T')[0];
      const qrData = JSON.stringify({
        type: type,
        date: today,
        timestamp: Date.now()
      });

      const response = await axios.post('/api/attendance/scan', {
        qrData,
        employeeId: employeeId.trim(),
        employeeName: employeeName.trim()
      });

      setMessage(`${response.data.message} at ${new Date().toLocaleTimeString()}`);
      
      // Clear form after successful scan
      if (response.data.message.includes('successful')) {
        setEmployeeId('');
        setName('');
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scanner-container">
      <div className="scanner-card">
        <h1>Employee Attendance System</h1>
        <p>Scan QR Code and Enter Your Details</p>
        
        <div className="form-group">
          <label>Employee ID:</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter your employee ID"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
        </div>

        <div className="button-group">
          <button
            onClick={() => handleScan('checkin')}
            disabled={isLoading}
            className="btn btn-checkin"
          >
            {isLoading ? 'Processing...' : 'Check In'}
          </button>
          
          <button
            onClick={() => handleScan('checkout')}
            disabled={isLoading}
            className="btn btn-checkout"
          >
            {isLoading ? 'Processing...' : 'Check Out'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('error') || message.includes('Invalid') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="admin-link">
          <a href="/admin/login">Admin Login</a>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;
