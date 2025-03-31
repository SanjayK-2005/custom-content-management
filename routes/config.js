const express = require('express');
const router = express.Router();

router.get('/config.js', (req, res) => {
    // Only expose necessary environment variables
    const config = {
        API_URL: process.env.API_URL || 'http://localhost:3000/api'
    };

    // Send as JavaScript that sets window.APP_CONFIG
    res.set('Content-Type', 'application/javascript');
    res.send(`window.APP_CONFIG = ${JSON.stringify(config, null, 2)};`);
});

module.exports = router; 