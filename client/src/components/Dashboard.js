import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Attendance Management System</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Employees</h3>
            <div className="stat-number">{stats.totalEmployees || 0}</div>
          </div>
          
          <div className="stat-card">
            <h3>Present Today</h3>
            <div className="stat-number">{stats.presentToday || 0}</div>
          </div>
          
          <div className="stat-card">
            <h3>Checked Out Today</h3>
            <div className="stat-number">{stats.checkedOutToday || 0}</div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link to="/admin/qr-generator" className="action-card">
              <h3>Generate QR Codes</h3>
              <p>Generate daily check-in/out QR codes</p>
            </Link>
            
            <Link to="/admin/reports" className="action-card">
              <h3>View Reports</h3>
              <p>Check attendance reports and analytics</p>
            </Link>
            
            <Link to="/admin/employees" className="action-card">
              <h3>Manage Employees</h3>
              <p>Add, edit, and manage employee records</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
