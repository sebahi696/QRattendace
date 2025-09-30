import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    employeeId: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);

      const response = await axios.get(`/api/reports/attendance?${params}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.employeeId]);

  useEffect(() => {
    fetchEmployees();
    fetchReports();
  }, [fetchReports]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    fetchReports();
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.employee_id === employeeId);
    return employee ? employee.name : employeeId;
  };

  const calculateWorkingHours = (checkin, checkout) => {
    if (!checkin || !checkout) return 'N/A';
    
    const start = moment(checkin);
    const end = moment(checkout);
    const duration = moment.duration(end.diff(start));
    
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="reports">
      <div className="container">
        <h1>Attendance Reports</h1>

        <div className="filters-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Employee:</label>
              <select
                value={filters.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.name} ({emp.employee_id})
                  </option>
                ))}
              </select>
            </div>
            
            <button onClick={handleSearch} className="search-btn">
              Search
            </button>
          </div>
        </div>

        <div className="reports-section">
          {loading ? (
            <div className="loading">Loading reports...</div>
          ) : (
            <div className="reports-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Working Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">No attendance records found</td>
                    </tr>
                  ) : (
                    reports.map(record => (
                      <tr key={record.id}>
                        <td>{moment(record.date).format('MMM DD, YYYY')}</td>
                        <td>{getEmployeeName(record.employee_id)}</td>
                        <td>{record.checkin_time ? moment(record.checkin_time).format('HH:mm:ss') : 'Not checked in'}</td>
                        <td>{record.checkout_time ? moment(record.checkout_time).format('HH:mm:ss') : 'Not checked out'}</td>
                        <td>{calculateWorkingHours(record.checkin_time, record.checkout_time)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
