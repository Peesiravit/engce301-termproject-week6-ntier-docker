const express = require('express');
const cors = require('cors');
const { query } = require('./src/config/database');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await query('SELECT * FROM tasks');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(3000, () => console.log('🚀 API Running on port 3000'));
