const mysql = require('mysql2/promise');
const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = require('./config/config');

const config = {
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
};

async function connectDatabase() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('Connected to the database');
    return connection;
  } catch (err) {
    console.error('Error connecting to the database:', err.stack);
    throw err;
  }
}

module.exports = connectDatabase;