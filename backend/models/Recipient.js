const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipient = sequelize.define('Recipient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  account_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  bank_code: {
    type: DataTypes.STRING(10),
    defaultValue: 'INTERNAL'
  },
  recipient_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'recipients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['account_number'] }
  ]
});

module.exports = Recipient;