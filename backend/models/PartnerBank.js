const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PartnerBank = sequelize.define('PartnerBank', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bank_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  api_endpoint: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  security_type: {
    type: DataTypes.ENUM('RSA', 'PGP'),
    allowNull: false
  },
  public_key: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  private_key: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  secret_key: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'partner_banks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['bank_code'] }
  ]
});

module.exports = PartnerBank;
