const mysql = require('mysql2/promise');
require('dotenv').config();
console.log(process.env.DB_HOST, process.env.DB_PORT);

const pool = mysql.createPool({ 
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS fecha');
    console.log('Conexión a la DB exitosa! Hora actual:', rows[0].fecha);
  } catch (err) {
    console.error('Error al conectar a la DB:', err.message);
  }
}

testConnection();
module.exports = pool;