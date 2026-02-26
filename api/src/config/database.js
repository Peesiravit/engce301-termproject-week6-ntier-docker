const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: 5432,
    database: process.env.DB_NAME || 'taskboard_db',
    user: process.env.DB_USER || 'taskboard',
    password: process.env.DB_PASSWORD || 'taskboard123',
});
module.exports = { query: (text, params) => pool.query(text, params) };
