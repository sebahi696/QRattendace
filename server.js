const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration for production
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup - SQLite for development, PostgreSQL for production
let db;
if (isProduction && DATABASE_URL) {
  // For production, we'll use PostgreSQL
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  // Create a simple query function for PostgreSQL
  db = {
    run: (query, params = []) => {
      return new Promise((resolve, reject) => {
        pool.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve({ lastID: result.insertId || result.rows[0]?.id });
        });
      });
    },
    get: (query, params = []) => {
      return new Promise((resolve, reject) => {
        pool.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve(result.rows[0]);
        });
      });
    },
    all: (query, params = []) => {
      return new Promise((resolve, reject) => {
        pool.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve(result.rows);
        });
      });
    }
  };
} else {
  // For development, use SQLite
  db = new sqlite3.Database('./attendance.db');
}

// Initialize database tables
const initializeDatabase = async () => {
  try {
    if (isProduction && DATABASE_URL) {
      // PostgreSQL table creation
      await db.run(`CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        position TEXT,
        department TEXT,
        working_hours TEXT DEFAULT '9:00-17:00',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      await db.run(`CREATE TABLE IF NOT EXISTS qr_codes (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        qr_data TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      await db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id TEXT NOT NULL,
        date TEXT NOT NULL,
        checkin_time TIMESTAMP,
        checkout_time TIMESTAMP,
        checkin_qr_id INTEGER,
        checkout_qr_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (checkin_qr_id) REFERENCES qr_codes (id),
        FOREIGN KEY (checkout_qr_id) REFERENCES qr_codes (id)
      )`);

      await db.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      // Insert default admin user
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await db.run(`INSERT INTO admin_users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING`, ['admin', hashedPassword]);
      
      console.log('PostgreSQL tables created successfully');
    } else {
      // SQLite table creation (development)
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          position TEXT,
          department TEXT,
          working_hours TEXT DEFAULT '9:00-17:00',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS qr_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          qr_data TEXT NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id TEXT NOT NULL,
          date TEXT NOT NULL,
          checkin_time DATETIME,
          checkout_time DATETIME,
          checkin_qr_id INTEGER,
          checkout_qr_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (checkin_qr_id) REFERENCES qr_codes (id),
          FOREIGN KEY (checkout_qr_id) REFERENCES qr_codes (id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT OR IGNORE INTO admin_users (username, password) VALUES ('admin', ?)`, [hashedPassword]);
      });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Initialize database on startup
initializeDatabase();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM admin_users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, username: user.username });
  });
});

// Generate QR codes for today
app.post('/api/admin/generate-qr', authenticateToken, async (req, res) => {
  const today = moment().format('YYYY-MM-DD');
  const baseUrl = process.env.RAILWAY_URL || 'https://web-production-d9315.up.railway.app';
  
  try {
    // Generate check-in QR with Railway URL
    const checkinData = JSON.stringify({
      type: 'checkin',
      date: today,
      timestamp: Date.now(),
      url: baseUrl
    });
    
    const checkinQR = await QRCode.toDataURL(checkinData);
    
    // Generate check-out QR with Railway URL
    const checkoutData = JSON.stringify({
      type: 'checkout',
      date: today,
      timestamp: Date.now(),
      url: baseUrl
    });
    
    const checkoutQR = await QRCode.toDataURL(checkoutData);

    // Save to database
    db.run('INSERT INTO qr_codes (date, type, qr_data) VALUES (?, ?, ?)', 
      [today, 'checkin', checkinData], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to save checkin QR' });
        
        const checkinId = this.lastID;
        
        db.run('INSERT INTO qr_codes (date, type, qr_data) VALUES (?, ?, ?)', 
          [today, 'checkout', checkoutData], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to save checkout QR' });
            
            const checkoutId = this.lastID;
            
    // Also generate simple URL QR codes for direct access
    const simpleCheckinQR = await QRCode.toDataURL(baseUrl);
    const simpleCheckoutQR = await QRCode.toDataURL(baseUrl);

    res.json({
      checkin: { id: checkinId, qr: checkinQR, data: checkinData, simpleQR: simpleCheckinQR },
      checkout: { id: checkoutId, qr: checkoutQR, data: checkoutData, simpleQR: simpleCheckoutQR },
      date: today,
      url: baseUrl
    });
          });
      });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR codes' });
  }
});

// Get today's QR codes
app.get('/api/qr-codes/:date', (req, res) => {
  const { date } = req.params;
  
  db.all('SELECT * FROM qr_codes WHERE date = ? AND is_active = 1', [date], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

// Generate simple QR code with just the URL
app.get('/api/simple-qr', async (req, res) => {
  try {
    const baseUrl = process.env.RAILWAY_URL || 'https://web-production-d9315.up.railway.app';
    const qrCode = await QRCode.toDataURL(baseUrl);
    res.json({ qr: qrCode, url: baseUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Process QR scan (check-in/check-out)
app.post('/api/attendance/scan', (req, res) => {
  const { qrData, employeeId } = req.body;
  
  try {
    const qrInfo = JSON.parse(qrData);
    const today = moment().format('YYYY-MM-DD');
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    
    // Check if QR is for today
    if (qrInfo.date !== today) {
      return res.status(400).json({ error: 'QR code is not valid for today' });
    }
    
    // Find employee
    db.get('SELECT * FROM employees WHERE employee_id = ?', [employeeId], (err, employee) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!employee) {
        return res.status(400).json({ error: 'Employee not found. Please contact admin to register your ID.' });
      }
      
      processAttendance(qrInfo, employeeId, now);
    });
    
    function processAttendance(qrInfo, empId, timestamp) {
      if (qrInfo.type === 'checkin') {
        // Handle check-in
        db.get('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', 
          [empId, today], (err, record) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            if (record && record.checkin_time) {
              return res.status(400).json({ error: 'Already checked in today' });
            }
            
            if (record) {
              // Update existing record
              db.run('UPDATE attendance SET checkin_time = ? WHERE id = ?', 
                [timestamp, record.id], function(err) {
                  if (err) return res.status(500).json({ error: 'Failed to update attendance' });
                  res.json({ message: 'Check-in successful', type: 'checkin' });
                });
            } else {
              // Create new record
              db.run('INSERT INTO attendance (employee_id, date, checkin_time) VALUES (?, ?, ?)', 
                [empId, today, timestamp], function(err) {
                  if (err) return res.status(500).json({ error: 'Failed to record attendance' });
                  res.json({ message: 'Check-in successful', type: 'checkin' });
                });
            }
          });
      } else if (qrInfo.type === 'checkout') {
        // Handle check-out
        db.get('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', 
          [empId, today], (err, record) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            if (!record || !record.checkin_time) {
              return res.status(400).json({ error: 'Must check in before checking out' });
            }
            
            if (record.checkout_time) {
              return res.status(400).json({ error: 'Already checked out today' });
            }
            
            db.run('UPDATE attendance SET checkout_time = ? WHERE id = ?', 
              [timestamp, record.id], function(err) {
                if (err) return res.status(500).json({ error: 'Failed to update attendance' });
                res.json({ message: 'Check-out successful', type: 'checkout' });
              });
          });
      }
    }
    
  } catch (error) {
    res.status(400).json({ error: 'Invalid QR code data' });
  }
});

// Get attendance reports
app.get('/api/reports/attendance', authenticateToken, (req, res) => {
  const { startDate, endDate, employeeId } = req.query;
  
  let query = `
    SELECT a.*, e.name, e.employee_id 
    FROM attendance a 
    JOIN employees e ON a.employee_id = e.employee_id 
    WHERE 1=1
  `;
  const params = [];
  
  if (startDate) {
    query += ' AND a.date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND a.date <= ?';
    params.push(endDate);
  }
  
  if (employeeId) {
    query += ' AND a.employee_id = ?';
    params.push(employeeId);
  }
  
  query += ' ORDER BY a.date DESC, a.checkin_time DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

// Get all employees
app.get('/api/employees', authenticateToken, (req, res) => {
  db.all('SELECT * FROM employees ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Add new employee
app.post('/api/employees', authenticateToken, (req, res) => {
  const { employee_id, name, email, phone, position, department, working_hours } = req.body;
  
  db.run('INSERT INTO employees (employee_id, name, email, phone, position, department, working_hours) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [employee_id, name, email, phone, position, department, working_hours || '9:00-17:00'], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add employee' });
      }
      res.json({ id: this.lastID, message: 'Employee added successfully' });
    });
});

// Get dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const today = moment().format('YYYY-MM-DD');
  
  const queries = [
    'SELECT COUNT(*) as total FROM employees',
    'SELECT COUNT(*) as present FROM attendance WHERE date = ? AND checkin_time IS NOT NULL',
    'SELECT COUNT(*) as checked_out FROM attendance WHERE date = ? AND checkout_time IS NOT NULL'
  ];
  
  const results = {};
  let completed = 0;
  
  queries.forEach((query, index) => {
    const params = index > 0 ? [today] : [];
    db.get(query, params, (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (index === 0) results.totalEmployees = row.total;
      if (index === 1) results.presentToday = row.present;
      if (index === 2) results.checkedOutToday = row.checked_out;
      
      completed++;
      if (completed === queries.length) {
        res.json(results);
      }
    });
  });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // In development, serve a simple message for the root route
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head><title>Employee Attendance System</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>🏢 Employee Attendance System</h1>
          <p>Backend API is running on port 5000</p>
          <p>React Frontend should be running on <a href="http://localhost:3000">http://localhost:3000</a></p>
          <p>If React is not running, please run: <code>cd client && npm start</code></p>
          <hr>
          <p><strong>API Endpoints:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>POST /api/admin/login</li>
            <li>POST /api/admin/generate-qr</li>
            <li>POST /api/attendance/scan</li>
            <li>GET /api/reports/attendance</li>
            <li>GET /api/employees</li>
          </ul>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for the attendance scanner`);
  console.log(`Visit http://localhost:${PORT}/admin/login for admin panel`);
});
