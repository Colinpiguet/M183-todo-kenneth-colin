const mysql = require('mysql2/promise');
const dbConfig = require('../config');

// Verbindung zur Datenbank herstellen
async function connectDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Database connected');
        return connection;
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
}

async function executeStatement(statement, values = []) {
    let conn = await connectDB();
    const [results, fields] = await conn.execute(statement, values);
    return results;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

module.exports = { connectDB: connectDB, executeStatement: executeStatement, escapeHtml: escapeHtml };