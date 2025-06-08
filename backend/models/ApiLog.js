const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApiLog = sequelize.define('ApiLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  partner_bank_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  request_type: {
    type: DataTypes.ENUM('account_info', 'deposit_money'),
    allowNull: false
  },
  request_data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  response_data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    allowNull: false
  },
  signature: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'api_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['partner_bank_id'] },
    { fields: ['request_type'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ApiLog;
