const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtpCode = sequelize.define('OtpCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('transfer', 'debt_payment', 'password_reset'),
    allowNull: false
  },
  reference_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'otp_codes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['code'] },
    { fields: ['expires_at'] }
  ]
});

module.exports = OtpCode;
