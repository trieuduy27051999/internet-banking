const User = require('./User');
const Account = require('./Account');
const Recipient = require('./Recipient');
const PartnerBank = require('./PartnerBank');
const Transaction = require('./Transaction');
const DebtReminder = require('./DebtReminder');
const OtpCode = require('./OtpCode');
const Notification = require('./Notification');
const RefreshToken = require('./RefreshToken');
const ApiLog = require('./ApiLog');

// Define Associations
// User - Account (One to Many)
User.hasMany(Account, { 
  foreignKey: 'user_id', 
  as: 'accounts',
  onDelete: 'CASCADE'
});
Account.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// User - Recipient (One to Many)
User.hasMany(Recipient, { 
  foreignKey: 'user_id', 
  as: 'recipients',
  onDelete: 'CASCADE'
});
Recipient.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// Account - Transaction (One to Many for both from and to)
Account.hasMany(Transaction, { 
  foreignKey: 'from_account_id', 
  as: 'sentTransactions',
  onDelete: 'SET NULL'
});
Account.hasMany(Transaction, { 
  foreignKey: 'to_account_id', 
  as: 'receivedTransactions',
  onDelete: 'SET NULL'
});
Transaction.belongsTo(Account, { 
  foreignKey: 'from_account_id', 
  as: 'fromAccount' 
});
Transaction.belongsTo(Account, { 
  foreignKey: 'to_account_id', 
  as: 'toAccount' 
});

// User - DebtReminder (One to Many)
User.hasMany(DebtReminder, { 
  foreignKey: 'creditor_id', 
  as: 'debtReminders',
  onDelete: 'CASCADE'
});
DebtReminder.belongsTo(User, { 
  foreignKey: 'creditor_id', 
  as: 'creditor' 
});

// Account - DebtReminder (One to Many)
Account.hasMany(DebtReminder, { 
  foreignKey: 'debtor_account_id', 
  as: 'debtReminders',
  onDelete: 'CASCADE'
});
DebtReminder.belongsTo(Account, { 
  foreignKey: 'debtor_account_id', 
  as: 'debtorAccount' 
});

// User - OtpCode (One to Many)
User.hasMany(OtpCode, { 
  foreignKey: 'user_id', 
  as: 'otpCodes',
  onDelete: 'CASCADE'
});
OtpCode.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// User - Notification (One to Many)
User.hasMany(Notification, { 
  foreignKey: 'user_id', 
  as: 'notifications',
  onDelete: 'CASCADE'
});
Notification.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// User - RefreshToken (One to Many)
User.hasMany(RefreshToken, { 
  foreignKey: 'user_id', 
  as: 'refreshTokens',
  onDelete: 'CASCADE'
});
RefreshToken.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// PartnerBank - ApiLog (One to Many)
PartnerBank.hasMany(ApiLog, { 
  foreignKey: 'partner_bank_id', 
  as: 'apiLogs',
  onDelete: 'SET NULL'
});
ApiLog.belongsTo(PartnerBank, { 
  foreignKey: 'partner_bank_id', 
  as: 'partnerBank' 
});

module.exports = {
  User,
  Account,
  Recipient,
  PartnerBank,
  Transaction,
  DebtReminder,
  OtpCode,
  Notification,
  RefreshToken,
  ApiLog
};
