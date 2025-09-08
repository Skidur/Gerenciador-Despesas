const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao SQLite!');
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    )
`, (err) => {
    if (err) console.error("Erro ao criar/alterar tabela 'transactions':", err.message);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullName TEXT NOT NULL,
            birthDate TEXT NOT NULL
        )
    `, (err) => {
        if (err) console.error("Erro ao criar tabela 'users':", err.message);
    });
});

module.exports = db;