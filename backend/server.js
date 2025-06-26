const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import middleware và routes
const loginLimiter = require('./middleware/loginLimiter'); // Nếu có, nếu không thì bỏ dòng này
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const accountRoutes = require('./routes/account');
const externalRoutes = require('./routes/external');
const apiLogRoutes = require('./routes/apiLog');
const notificationRoutes = require('./routes/notification');
const transactionRoutes = require('./routes/transaction'); // Thêm dòng này

// Routes setup
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/external', externalRoutes); // Thêm dòng này
app.use('/api/api-logs', apiLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transactions', transactionRoutes); // Thêm dòng này

// Route kiểm tra server sống
app.get('/', (req, res) => {
  res.json({ message: 'Internet Banking API is running!' });
});

// Xử lý 404 cho API
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

