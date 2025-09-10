require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const db = {
    query: (text, params) => pool.query(text, params),

    get: async (sql, params = []) => {
        const result = await pool.query(sql, params);
        return result.rows[0];
    },
    run: async (sql, params = []) => {
        return await pool.query(sql, params);
    },
    all: async (sql, params = []) => {
        const result = await pool.query(sql, params);
        return result.rows;
    }
};

const initializeDatabase = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                fullName TEXT NOT NULL,
                birthDate TEXT NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                description TEXT,
                status TEXT CHECK(status IN ('pago', 'pendente')) NOT NULL DEFAULT 'pago',
                installmentGroupId TEXT,
                recurringGroupId TEXT,
                userId INTEGER NOT NULL,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Banco de dados PostgreSQL inicializado com sucesso!");
    } catch (err) {
        console.error("Erro ao inicializar o banco de dados PostgreSQL:", err.message);
    }
};

initializeDatabase();

module.exports = db;