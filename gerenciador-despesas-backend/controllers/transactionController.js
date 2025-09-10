const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

exports.getAllTransactions = async (req, res) => {
    const userId = req.user.id;
    try {
        const rows = await db.all('SELECT * FROM transactions WHERE userId = $1 ORDER BY date DESC', [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
};

exports.addTransaction = async (req, res) => {
    const userId = req.user.id;
    const { type, amount, category, date, description, status = 'pago' } = req.body;
    const sql = `
        INSERT INTO transactions (type, amount, category, date, description, status, userId) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;
    try {
        const result = await db.run(sql, [type, amount, category, date, description, status, userId]);
        res.status(201).json({ id: result.rows[0].id, message: 'Transação adicionada com sucesso!' });
    } catch (err) {
        console.error("Erro no DB ao adicionar transação:", err.message);
        return res.status(500).json({ error: 'Erro ao adicionar transação' });
    }
};

exports.updateTransaction = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { type, amount, category, date, description, status } = req.body;
    const sql = `
        UPDATE transactions 
        SET type = $1, amount = $2, category = $3, date = $4, description = $5, status = $6 
        WHERE id = $7 AND userId = $8
    `;
    try {
        const result = await db.run(sql, [type, amount, category, date, description, status, id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });
        }
        res.json({ message: 'Transação editada com sucesso!' });
    } catch (err) {
        return res.status(500).json({ error: 'Erro ao editar transação' });
    }
};

exports.deleteTransaction = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const result = await db.run(`DELETE FROM transactions WHERE id = $1 AND userId = $2`, [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });
        }
        res.json({ message: 'Transação excluída com sucesso!' });
    } catch (err) {
        return res.status(500).json({ error: 'Erro ao excluir transação' });
    }
};

exports.deleteAllTransactions = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.run(`DELETE FROM transactions WHERE userId = $1`, [userId]);
        res.status(204).send();
    } catch (err) {
        return res.status(500).send('Erro ao excluir as transações do usuário');
    }
};

exports.markAsPaid = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const result = await db.run(`UPDATE transactions SET status = 'pago' WHERE id = $1 AND userId = $2`, [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });
        }
        res.json({ message: 'Transação marcada como paga com sucesso!' });
    } catch (err) {
        return res.status(500).json({ error: 'Erro ao marcar transação como paga' });
    }
};

exports.markAsPending = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const result = await db.run(`UPDATE transactions SET status = 'pendente' WHERE id = $1 AND userId = $2`, [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });
        }
        res.json({ message: 'Transação marcada como pendente com sucesso!' });
    } catch (err) {
        return res.status(500).json({ error: 'Erro ao marcar transação como pendente' });
    }
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
        VALUES ('expense', $1, $2, $3, $4, 'pendente', $5, $6)
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
        VALUES ('income', $1, $2, $3, $4, 'pago', $5, $6)
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