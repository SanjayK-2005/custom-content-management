const db = require('./db');

async function checkTables() {
    try {
        // Check users table
        console.log('Checking users table...');
        const [userTable] = await db.promise().query('DESCRIBE users');
        console.log('Users table structure:', userTable);

        // Check posts table
        console.log('\nChecking posts table...');
        const [postTable] = await db.promise().query('DESCRIBE posts');
        console.log('Posts table structure:', postTable);

        process.exit(0);
    } catch (error) {
        console.error('Error checking tables:', error);
        process.exit(1);
    }
}

checkTables(); 