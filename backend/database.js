const mysql = require('mysql2');
require('dotenv').config();


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});




const addMessage = async ({ sender, content }) => {
    try {
        const query = 'INSERT INTO messages (sender, content) VALUES (?, ?)';
        await pool.promise().execute(query, [sender, content]);
    } catch (error) {
        throw error;
    }
};

const getChatHistory = async () => {
    try {
        const [results] = await pool.promise().query('SELECT sender, content, ts FROM messages ORDER BY ts ASC');
        return results.map((row) => ({
            sender: row.sender,
            content: row.content,
            ts: row.ts,
        }));
    } catch (error) {
        throw error;
    }
};


module.exports = {
    addMessage,
    getChatHistory
};