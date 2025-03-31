const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initializeDatabase() {
    try {
        // Read the SQL file
        const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

        // Split the SQL file into individual statements
        const statements = sql.split(';').filter(stmt => stmt.trim());

        // Execute each statement
        for (let statement of statements) {
            if (statement.trim()) {
                await db.promise().query(statement);
                console.log('Executed SQL statement successfully');
            }
        }

        console.log('Database initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase(); 