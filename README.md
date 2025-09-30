# Employee QR Attendance Management System

A comprehensive QR code-based employee attendance management system built with React.js and Express.js.

## 🚀 Features

- **QR Code Generation**: Generate daily check-in/check-out QR codes
- **Employee Management**: Add, edit, and manage employee records
- **Attendance Tracking**: Real-time attendance scanning and tracking
- **Reports & Analytics**: Comprehensive attendance reports and statistics
- **Admin Dashboard**: Full administrative control panel
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Technology Stack

- **Frontend**: React.js, React Router, Axios
- **Backend**: Express.js, Node.js
- **Database**: SQLite (Development), PostgreSQL (Production)
- **Authentication**: JWT-based authentication
- **QR Code**: QRCode.js library
- **Charts**: Chart.js for analytics

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (for production)

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QRattendace
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Start the development servers**
   ```bash
   # Windows
   start-system.bat
   
   # PowerShell
   ./start-servers.ps1
   
   # Manual
   npm start  # Backend (port 5000)
   cd client && npm start  # Frontend (port 3000)
   ```

4. **Access the application**
   - Employee Scanner: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin/login
   - Default Admin Credentials: `admin` / `admin123`

### Production Deployment

#### Railway Deployment

1. **Set up Railway project**
   - Connect your GitHub repository to Railway
   - Add PostgreSQL database service
   - Configure environment variables

2. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Deploy**
   - Railway will automatically build and deploy
   - The system will use PostgreSQL in production

#### Manual Production Setup

1. **Build the React app**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your-postgresql-connection-string
   export JWT_SECRET=your-secret-key
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
QRattendace/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── ...
│   └── package.json
├── server.js              # Express server
├── package.json           # Backend dependencies
├── railway.json           # Railway configuration
├── Procfile              # Process configuration
└── README.md
```

## 🔧 API Endpoints

- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/generate-qr` - Generate QR codes
- `POST /api/attendance/scan` - Process attendance scan
- `GET /api/reports/attendance` - Get attendance reports
- `GET /api/employees` - Get employee list
- `POST /api/employees` - Add new employee
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🗄️ Database Schema

### Tables
- `employees` - Employee information
- `attendance` - Attendance records
- `qr_codes` - Generated QR codes
- `admin_users` - Admin user accounts

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected admin routes
- Input validation and sanitization

## 🧪 Testing

Run the system test:
```bash
node test-system.js
```

## 📱 Usage

### For Employees
1. Visit the scanner page
2. Enter your Employee ID and Name
3. Click "Check In" or "Check Out"
4. System will process your attendance

### For Administrators
1. Login to admin panel
2. Generate daily QR codes
3. Manage employees
4. View attendance reports
5. Monitor system statistics

## 🚀 Deployment Checklist

- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Update JWT secret key
- [ ] Test all functionality
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review the test system output
- Contact the development team

---

**Built with ❤️ for efficient employee attendance management**
