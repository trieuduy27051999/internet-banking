const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  from_account_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  to_account_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transaction_type: {
    type: DataTypes.ENUM('transfer_internal', 'transfer_external', 'deposit', 'debt_payment'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  fee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  fee_payer: {
    type: DataTypes.ENUM('sender', 'receiver'),
    defaultValue: 'sender'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  bank_code: {
    type: DataTypes.STRING(10),
    defaultValue: 'INTERNAL'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['from_account_id'] },
    { fields: ['to_account_id'] },
    { fields: ['transaction_type'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

// Update balance after transaction completion
// Transaction.afterUpdate(async (transaction, options) => {
//   if (transaction.status === 'completed' && transaction._previousDataValues.status !== 'completed') {
//     const Account = require('./Account');
    
//     // Deduct from sender account
//     if (transaction.from_account_id) {
//       const senderFee = transaction.fee_payer === 'sender' ? transaction.fee : 0;
//       await Account.decrement('balance', {
//         by: parseFloat(transaction.amount) + parseFloat(senderFee),
//         where: { id: transaction.from_account_id }
//       });
//     }
    
//     // Add to receiver account
//     if (transaction.to_account_id) {
//       const receiverFee = transaction.fee_payer === 'receiver' ? transaction.fee : 0;
//       await Account.increment('balance', {
//         by: parseFloat(transaction.amount) - parseFloat(receiverFee),
//         where: { id: transaction.to_account_id }
//       });
//     }
//   }
// });

module.exports = Transaction;