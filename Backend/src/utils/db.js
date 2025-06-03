const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',        
  user: 'root',
  password: 'cmu65',         
  database: 'trippify'       
});

module.exports = pool;

// async function testConnection() {
//   try {
//     const [rows] = await pool.query('SELECT 1 + 1 AS result'); // แก้จาก db เป็น pool
//     console.log('DB connected ✅', rows);
//   } catch (error) {
//     console.error('DB connection error ❌', error);
//   }
// }

// testConnection();
