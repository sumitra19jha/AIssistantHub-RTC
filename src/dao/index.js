const config = require("../config/config");
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: config.MYSQL_HOST,
  port: config.MYSQL_PORT,
  user: config.MYSQL_USER,
  password: config.MYSQL_PASSWORD,
  database: config.MYSQL_DATABASE,
});

console.log("DB Connection Success!");

exports.connPool = pool;
