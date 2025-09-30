const axios = require('axios');

async function testSystem() {
  console.log('🧪 Testing Employee QR Attendance System...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const response = await axios.get('http://localhost:5000/api/dashboard/stats');
    console.log('✅ Server is running on port 5000');
  } catch (error) {
    console.log('❌ Server is not running. Please start the server with: npm start');
    return;
  }

  try {
    // Test 2: Test admin login
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Admin login successful');
    const token = loginResponse.data.token;

    // Test 3: Generate QR codes
    console.log('\n3. Testing QR code generation...');
    const qrResponse = await axios.post('http://localhost:5000/api/admin/generate-qr', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ QR codes generated successfully');
    console.log(`   - Check-in QR: ${qrResponse.data.checkin.qr.substring(0, 50)}...`);
    console.log(`   - Check-out QR: ${qrResponse.data.checkout.qr.substring(0, 50)}...`);

    // Test 4: Test attendance scan
    console.log('\n4. Testing attendance scan...');
    const today = new Date().toISOString().split('T')[0];
    const qrData = JSON.stringify({
      type: 'checkin',
      date: today,
      timestamp: Date.now()
    });

    const scanResponse = await axios.post('http://localhost:5000/api/attendance/scan', {
      qrData,
      employeeId: 'TEST001',
      employeeName: 'Test Employee'
    });
    console.log('✅ Attendance scan successful:', scanResponse.data.message);

    // Test 5: Get reports
    console.log('\n5. Testing reports...');
    const reportsResponse = await axios.get(`http://localhost:5000/api/reports/attendance?startDate=${today}&endDate=${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Reports generated successfully');
    console.log(`   - Found ${reportsResponse.data.length} attendance records`);

    console.log('\n🎉 All tests passed! The system is working correctly.');
    console.log('\n📱 Access the system at:');
    console.log('   - Employee Scanner: http://localhost:3000');
    console.log('   - Admin Panel: http://localhost:3000/admin/login');
    console.log('\n🔑 Admin credentials:');
    console.log('   - Username: admin');
    console.log('   - Password: admin123');

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.error || error.message);
  }
}

testSystem();
