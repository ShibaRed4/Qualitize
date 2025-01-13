const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './backend/database/prod.sqlite',  // Path to your SQLite file
  logging: false,  // Disable logging SQL queries
});

// Define a sample model for demonstration
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_data: {
    type: DataTypes.JSON,
    allowNull: false
  }
});

// Sync the database (create tables if not exists)
async function syncDatabase() {
  try {
    await sequelize.sync({ force: false });  // Set force: true to drop and recreate tables
    console.log('Database synced');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

module.exports = {
  sequelize,   // Export the sequelize instance
  User,        // Export the User model for use in other scripts
  syncDatabase // Export the sync function to run the database sync
};
