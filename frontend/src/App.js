import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Transactions from './pages/Transactions';
import Transfer from './pages/Transfer';
import Recipients from './pages/Recipients';
import DebtReminders from './pages/DebtReminders';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminUsers from './pages/admin/Users';
import AdminAccounts from './pages/admin/Accounts';
import AdminBanks from './pages/admin/Banks';
import AdminApiLogs from './pages/admin/ApiLogs';

function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');
  return isAuthenticated && role === 'admin' ? children : <Navigate to="/login" />;
}

function EmployeeRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');
  return isAuthenticated && (role === 'employee' || role === 'admin') ? children : <Navigate to="/login" />;
}

function App() {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  return (
    <BrowserRouter>
      {/* Thanh điều hướng cho admin/employee */}
      {isAuthenticated && (role === 'admin' || role === 'employee') && (
        <nav style={{ padding: 16, background: '#f5f5f5', marginBottom: 24 }}>
          <Link to="/dashboard" style={{ marginRight: 16 }}>Dashboard</Link>
          <Link to="/admin/users" style={{ marginRight: 16 }}>Quản lý người dùng</Link>
          <Link to="/admin/accounts" style={{ marginRight: 16 }}>Quản lý tài khoản</Link>
          <Link to="/admin/banks" style={{ marginRight: 16 }}>Quản lý ngân hàng</Link>
          <Link to="/admin/api-logs" style={{ marginRight: 16 }}>Xem log API</Link>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            style={{ marginLeft: 24, padding: '4px 12px', cursor: 'pointer' }}
          >
            Đăng xuất
          </button>
        </nav>
      )}
      {/* Thanh điều hướng cho user thường */}
      {isAuthenticated && role === 'customer' && (
        <nav style={{ padding: 16, background: '#e3f2fd', marginBottom: 24 }}>
          <Link to="/dashboard" style={{ marginRight: 16 }}>Dashboard</Link>
          <Link to="/accounts" style={{ marginRight: 16 }}>Tài khoản</Link>
          <Link to="/transactions" style={{ marginRight: 16 }}>Giao dịch</Link>
          <Link to="/transfer" style={{ marginRight: 16 }}>Chuyển tiền</Link>
          <Link to="/recipients" style={{ marginRight: 16 }}>Người thụ hưởng</Link>
          <Link to="/debt-reminders" style={{ marginRight: 16 }}>Nhắc nợ</Link>
          <Link to="/notifications" style={{ marginRight: 16 }}>Thông báo</Link>
          <Link to="/profile" style={{ marginRight: 16 }}>Thông tin cá nhân</Link>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            style={{ marginLeft: 24, padding: '4px 12px', cursor: 'pointer' }}
          >
            Đăng xuất
          </button>
        </nav>
      )}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Customer routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
        <Route path="/accounts/:id" element={<PrivateRoute><AccountDetail /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/transfer" element={<PrivateRoute><Transfer /></PrivateRoute>} />
        <Route path="/recipients" element={<PrivateRoute><Recipients /></PrivateRoute>} />
        <Route path="/debt-reminders" element={<PrivateRoute><DebtReminders /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Employee/Admin routes */}
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/accounts" element={<EmployeeRoute><AdminAccounts /></EmployeeRoute>} />
        <Route path="/admin/banks" element={<AdminRoute><AdminBanks /></AdminRoute>} />
        <Route path="/admin/api-logs" element={<AdminRoute><AdminApiLogs /></AdminRoute>} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
