// Importa as dependências necessárias
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

// Configuração do CORS e do Express
// Habilita o CORS para permitir requisições apenas do frontend rodando em localhost:3000
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Configura o Express para aceitar requisições com corpo em formato JSON
app.use(express.json());

// Conexão com o banco de dados SQLite
// Cria ou conecta ao arquivo 'database.db' e exibe mensagem de sucesso ou erro
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err);
    } else {
        console.log('Conectado ao SQLite!');
    }
});

// Criação da tabela de transações no banco de dados
// Define a estrutura da tabela 'transactions' com campos para id, tipo, valor, categoria, data e descrição
db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT CHECK(type IN ('income', 'expense')),
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT
    )
`);

// Rota de teste
// Retorna uma mensagem simples para verificar se a API está funcionando
app.get('/', (req, res) => {
    res.send('API do Gerenciador de Despesas funcionando!');
});

// Rota para listar todas as transações
// Faz uma consulta ao banco de dados para buscar todas as transações e retorna os dados em formato JSON
app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions', [], (err, rows) => {
        if (err) {
            res.status(500).send('Erro ao buscar transações');
        } else {
            res.json(rows);
        }
    });
});

// Rota para adicionar uma nova transação
// Recebe os dados da transação via corpo da requisição e insere no banco de dados
app.post('/api/transactions', (req, res) => {
    const { type, amount, category, date, description } = req.body;
    const sql = `INSERT INTO transactions (type, amount, category, date, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [type, amount, category, date, description], function (err) {
        if (err) {
            res.status(500).send('Erro ao adicionar transação');
        } else {
            res.json({ id: this.lastID, message: 'Transação adicionada com sucesso!' });
        } 
    });
});

// Rota para editar uma transação existente
// Atualiza os dados de uma transação específica com base no ID fornecido
app.put('/api/transactions/:id', (req, res) => {
    const { type, amount, category, date, description } = req.body;
    const { id } = req.params;
    const sql = `UPDATE transactions SET type = ?, amount = ?, category = ?, date = ?, description = ? WHERE id = ?`;
    db.run(sql, [type, amount, category, date, description, id], function (err) {
        if (err) {
            res.status(500).send('Erro ao editar transação');
        } else if (this.changes === 0) {
            res.status(404).send('Transação não encontrada');
        } else {
            res.json({ message: 'Transação editada com sucesso!' });
        }
    });
});

// Rota para excluir uma transação específica
// Remove uma transação do banco de dados com base no ID fornecido
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM transactions WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            res.status(500).send('Erro ao excluir transação');
        } else if (this.changes === 0) {
            res.status(404).send('Transação não encontrada');
        } else {
            res.json({ message: 'Transação excluida com sucesso!' });
        }
    });
});

// Rota para excluir todas as transações
// Remove todas as transações do banco de dados e reseta o contador de IDs
app.delete('/api/transactions', (req, res) => {
    const sql = `DELETE FROM transactions`;
    db.run(sql, function (err) {
        if (err) {
            res.status(500).send('Erro ao excluir todas as transações');
        } else {
            // Reseta o contador de IDs da tabela para começar do 1 novamente
            db.run(`DELETE FROM sqlite_sequence WHERE name='transactions'`, (err) => {
                if (err) {
                    console.error('Erro ao resetar sequência:', err);
                }
                res.status(204).send();
            });
        }
    });
});

// Inicia o servidor na porta 3001
// Exibe uma mensagem no console para confirmar que o servidor está rodando
app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});