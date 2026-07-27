const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',

  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'car_release_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  charset: 'utf8mb4'
});

// Helper execute function
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Helper to check column existence dynamically
async function hasColumn(tableName, columnName) {
  try {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
    return rows.length > 0;
  } catch (err) {
    return false;
  }
}

module.exports = {
  pool,
  query,
  hasColumn
};

