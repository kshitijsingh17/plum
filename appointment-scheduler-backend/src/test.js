const express = require('express');
const app = express();

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(5000, '0.0.0.0', () => console.log('Server running on 0.0.0.0:5000'));
