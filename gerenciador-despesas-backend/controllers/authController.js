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

        const sql = `INSERT INTO users (username, password, fullName, birthDate) VALUES ($1, $2, $3, $4)`;

        db.run(sql, [username, hashedPassword, fullName, birthDate])
            .catch(err => {
            if (err.code === '23505') {
                return res.status(409).json({ error: 'Nome de usuário já existe.' });
            }
            console.error("Erro no DB ao registrar:", err.message);
            return res.status(500).json({ error: 'Erro ao registrar usuário.' });
            });

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const sql = `SELECT * FROM users WHERE username = $1`;

    try {
        const user = await db.get(sql, [username]);

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        let isBirthday = false;
        if (user.birthdate) {
            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDay = today.getDate();

            const birthDateParts = user.birthdate.split('-');
            const birthMonth = parseInt(birthDateParts[1], 10);
            const birthDay = parseInt(birthDateParts[2], 10);

            if (todayMonth === birthMonth && todayDay === birthDay) {
                isBirthday = true;
            }
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, fullName: user.fullname },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login bem-sucedido!', token, isBirthday });

    } catch (err) {
        console.error("Erro no login:", err.message);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};