const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const transactionRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth');

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API do Gerenciador de Despesas funcionando!');
});

app.use('/api/auth', authRoutes);

app.use('/api/transactions', transactionRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});