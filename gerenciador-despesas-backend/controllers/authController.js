const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'bWibVZJfovdoZoH87JhcicaC7T8M82nfCrPKqzU4vPgqBQPcLYaBPPz9GD0cNWg6';

exports.register = (req, res) => {
    const { username, password, fullName, birthDate } = req.body;

    if (!username || !password || !fullName || !birthDate) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criptografar a senha.' });
        }

        const sql = `INSERT INTO users (username, password, fullName, birthDate) VALUES (?, ?, ?, ?)`;

        db.run(sql, [username, hashedPassword, fullName, birthDate], function (err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Nome de usuário já existe.' });
                }
                console.error("Erro no DB ao registrar:", err.message);
                return res.status(500).json({ error: 'Erro ao registrar usuário.' });
            }
            res.status(201).json({ message: 'Usuário registrado com sucesso!' });
        });
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor.' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao verificar senha.' });
            }
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            let isBirthday = false;
            if (user.birthDate) {
                const today = new Date();
                const todayMonth = today.getMonth() + 1;
                const todayDay = today.getDate();

                const birthDateParts = user.birthDate.split('-');
                const birthMonth = parseInt(birthDateParts[1], 10);
                const birthDay = parseInt(birthDateParts[2], 10);

                if (todayMonth === birthMonth && todayDay === birthDay) {
                    isBirthday = true;
                }
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, fullName: user.fullName },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ message: 'Login bem-sucedido!', token, isBirthday });
        });
    });
};