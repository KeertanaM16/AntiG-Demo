require('dotenv').config();
const { Pool } = require('pg');

console.log('--- Debugging Environment Variables ---');
const password = process.env.DB_PASSWORD;
console.log(`Password loaded: ${password ? 'YES' : 'NO'}`);
if (password) {
    console.log(`Password length: ${password.length}`);
    console.log(`First char: ${password[0]}`);
    console.log(`Last char: ${password[password.length - 1]}`);
    console.log(`Contains #: ${password.includes('#')}`);
    console.log(`Contains &: ${password.includes('&')}`);
}
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log('---------------------------------------');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
    try {
        console.log('Attempting to connect to DB...');
        const client = await pool.connect();
        console.log('Successfully connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Query Result:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('Connection failed:', err.message);
        console.error('Error code:', err.code);
        if (err.code === '28P01') {
            console.error('Check username and password.');
        }
    } finally {
        await pool.end();
    }
}

testConnection();
