const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DebtReminder = sequelize.define('DebtReminder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  creditor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  debtor_account_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
    defaultValue: 'pending'
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancel_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'debt_reminders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['creditor_id'] },
    { fields: ['debtor_account_id'] },
    { fields: ['status'] }
  ]
});

module.exports = DebtReminder;