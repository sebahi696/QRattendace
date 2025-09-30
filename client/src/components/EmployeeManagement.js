import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    working_hours: '9:00-17:00'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await axios.post('/api/employees', formData);
      setMessage('Employee added successfully!');
      setFormData({
        employee_id: '',
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        working_hours: '9:00-17:00'
      });
      setShowForm(false);
      fetchEmployees();
    } catch (error) {
      setMessage('Error adding employee: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div className="employee-management">
      <div className="container">
        <div className="header">
          <h1>Employee Management</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="add-employee-btn"
          >
            {showForm ? 'Cancel' : 'Add Employee'}
          </button>
        </div>

        {showForm && (
          <div className="form-section">
            <h2>Add New Employee</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Working Hours</label>
                  <input
                    type="text"
                    name="working_hours"
                    value={formData.working_hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 9:00-17:00"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Add Employee
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>

            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </div>
        )}

        <div className="employees-section">
          <h2>Employee List</h2>
          
          {loading ? (
            <div className="loading">Loading employees...</div>
          ) : (
            <div className="employees-table">
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Working Hours</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">No employees found</td>
                    </tr>
                  ) : (
                    employees.map(employee => (
                      <tr key={employee.id}>
                        <td>{employee.employee_id}</td>
                        <td>{employee.name}</td>
                        <td>{employee.email || 'N/A'}</td>
                        <td>{employee.phone || 'N/A'}</td>
                        <td>{employee.position || 'N/A'}</td>
                        <td>{employee.department || 'N/A'}</td>
                        <td>{employee.working_hours || '9:00-17:00'}</td>
                        <td>{new Date(employee.created_at).toLocaleDateString()}</td>
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

export default EmployeeManagement;
