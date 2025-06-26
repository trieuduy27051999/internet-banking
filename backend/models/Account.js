const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  account_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  account_type: {
    type: DataTypes.ENUM('payment'),
    defaultValue: 'payment'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['account_number'] },
    { fields: ['user_id'] }
  ]
});

// Generate account number before creating account
Account.beforeCreate(async (account, options) => {
  if (!account.account_number) {
    account.account_number = `100100${account.user_id.toString().padStart(4, '0')}`;
  }
});

// Thiết lập quan hệ
Account.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Account, { foreignKey: 'user_id' });

module.exports = Account;