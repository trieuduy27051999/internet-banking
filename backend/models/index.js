const sequelize = require('../config/database');
const models = require('./associations');

// Export sequelize instance and all models
module.exports = {
  sequelize,
  ...models
};
