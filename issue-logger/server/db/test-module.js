const db = require('./index');

async function testInsert() {
    console.log('Testing insert via db module...');
    const query = 'INSERT INTO issue_logs (issue_text) VALUES ($1) RETURNING *';
    const values = ['Test issue from controller diagnostic'];
    
    try {
        const result = await db.query(query, values);
        console.log('Insert successful:', result.rows[0]);
    } catch (err) {
        console.error('Insert failed:', err);
        console.error('Connection parameters involved:', {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            db: process.env.DB_NAME,
            // don't log password
        });
    } finally {
        if (db.pool) await db.pool.end();
    }
}

testInsert();
