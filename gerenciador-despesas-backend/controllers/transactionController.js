const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

exports.getAllTransactions = (req, res) => {
    const userId = req.user.id;
    db.all('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar transações' });
        }
        res.json(rows);
    });
};

exports.addTransaction = (req, res) => {
    const userId = req.user.id;
    const { type, amount, category, date, description } = req.body;

    const status = req.body.status || 'pago'; 

    const sql = `
        INSERT INTO transactions 
        (type, amount, category, date, description, status, userId) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [type, amount, category, date, description, status, userId];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Erro no DB ao adicionar transação:", err.message);
            return res.status(500).json({ error: 'Erro ao adicionar transação' });
        }
        res.status(201).json({ id: this.lastID, message: 'Transação adicionada com sucesso!' });
    });
};

exports.updateTransaction = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { type, amount, category, date, description, status } = req.body;
    const sql = `UPDATE transactions SET type = ?, amount = ?, category = ?, date = ?, description = ?, status = ? WHERE id = ? AND userId = ?`;

    db.run(sql, [type, amount, category, date, description, status, id, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao editar transação' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });
        }
        res.json({ message: 'Transação editada com sucesso!' });
    });
};

exports.deleteTransaction = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const sql = `DELETE FROM transactions WHERE id = ? AND userId = ?`;

    db.run(sql, [id, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao excluir transação' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });
        }
        res.json({ message: 'Transação excluída com sucesso!' });
    });
};

exports.deleteAllTransactions = (req, res) => {
    const userId = req.user.id;
    const sql = `DELETE FROM transactions WHERE userId = ?`; 

    db.run(sql, [userId], function (err) { 
        if (err) {
            return res.status(500).send('Erro ao excluir as transações do usuário');
        }
        res.status(204).send();
    });
};

exports.markAsPaid = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const sql = `UPDATE transactions SET status = 'pago' WHERE id = ? AND userId = ?`;

    db.run(sql, [id, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao marcar transação como paga' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });
        }
        res.json({ message: 'Transação marcada como paga com sucesso!' });
    });
};

exports.addInstallmentTransaction = (req, res) => {
    const userId = req.user.id;
    const { amount, category, description, installments, startDate } = req.body;

    if (!amount || !category || !installments || !startDate || installments < 1) {
        return res.status(400).json({ error: 'Dados inválidos para parcelamento.' });
    }

    const installmentGroupId = uuidv4();

    const sql = `
        INSERT INTO transactions 
        (type, amount, category, date, description, status, installmentGroupId, userId) 
        VALUES ('expense', ?, ?, ?, ?, 'pendente', ?, ?)
    `;

    try {
        const firstDate = new Date(startDate);
        for (let i = 0; i < installments; i++) {
            const transactionDate = new Date(firstDate.getTime());
            transactionDate.setMonth(transactionDate.getMonth() + i);

            const formattedDate = transactionDate.toISOString().split('T')[0];

            const installmentDescription = `${description} (${i + 1}/${installments})`;

            db.run(sql, [amount, category, formattedDate, installmentDescription, installmentGroupId, userId]);
        }
        res.status(201).json({ message: 'Parcelamento adicionado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar o parcelamento.' });
    }
};

exports.markAsPending = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const sql = `UPDATE transactions SET status = 'pendente' WHERE id = ? AND userId = ?`;

    db.run(sql, [id, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao marcar transação como pendente' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });
        }
        res.json({ message: 'Transação marcada como pendente com sucesso!' });
    });
};

exports.addRecurringTransaction = (req, res) => {
    const userId = req.user.id;
    const { amount, category, description, repeatCount, dayOfMonth } = req.body;

    if (!amount || !category || !repeatCount || !dayOfMonth || repeatCount < 1) {
        return res.status(400).json({ error: 'Dados inválidos para receita recorrente.' });
    }

    const recurringGroupId = uuidv4();

    const sql = `
        INSERT INTO transactions
        (type, amount, category, date, description, status, recurringGroupId, userId)
        VALUES ('income', ?, ?, ?, ?, 'pago', ?, ?)
    `;

    try {
        const now = new Date();
        for (let i = 0; i < repeatCount; i++) {
            const transactionDate = new Date(now.getFullYear(), now.getMonth() + i, dayOfMonth);

            const formattedDate = transactionDate.toISOString().split('T')[0];

            const recurringDescription = description ? `${description} (Recorrência ${i + 1}/${repeatCount})` : `(Recorrência ${i + 1}/${repeatCount})`;

            db.run(sql, [amount, category, formattedDate, recurringDescription, recurringGroupId, userId]);
        }
        res.status(201).json({ message: 'Receitas recorrentes adicionadas com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar receitas recorrentes.' });
    }
};