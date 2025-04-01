# Gerenciador de Despesas Pessoais

## Descrição do Projeto

O **Gerenciador de Despesas Pessoais** é uma aplicação web desenvolvida para ajudar os usuários a controlar suas finanças de forma simples e eficiente. Com uma interface intuitiva, o app permite adicionar, editar e excluir transações (receitas e despesas), visualizar um resumo financeiro e analisar os dados por meio de gráficos interativos. O projeto foi construído com **React** no frontend e utiliza um backend básico (não incluído neste repositório) para gerenciar as transações.

### Funcionalidades Principais
- **Adição de Transações**: Registre receitas e despesas com valor, categoria, data e descrição.
- **Resumo Financeiro**: Veja o total de receitas, despesas, saldo, despesas pagas/pendentes e receita necessária.
- **Gráficos Interativos**: Visualize suas finanças com gráficos personalizáveis (pizza, barras, linhas, área, radar, etc.) para:
  - Receitas por categoria
  - Despesas vs. Saldo
  - Progresso financeiro
  - Variação do saldo ao longo do tempo
  - Despesas por mês
  - Comparação entre receitas e despesas
- **Histórico de Transações**: Liste todas as transações, agrupadas por mês, com filtros por mês, tipo, categoria, valor, data e descrição.
- **Edição e Exclusão**: Edite ou exclua transações com um modal intuitivo e confirmações para exclusões.

### Tecnologias Utilizadas
- **Frontend**: React, Chart.js (para gráficos), Flatpickr (para seleção de datas)
- **Estilização**: CSS com efeito de vidro (glassmorphism)
- **Backend**: API REST (não incluída neste repositório, mas espera-se um servidor rodando em `http://localhost:3001`)

---

## Como Executar o Projeto

Siga os passos abaixo para rodar o **Gerenciador de Despesas Pessoais** localmente.

### Pré-requisitos
- **Node.js** e **npm** instalados (recomendado: Node.js v16 ou superior).
- **Git** instalado para clonar o repositório.
- Um **backend** rodando em `http://localhost:3001` com endpoints para gerenciar transações (GET, POST, PUT, DELETE em `/api/transactions`). Você pode criar um backend simples com Node.js e Express, ou usar um mock.

### Passo a Passo

1. **Clone o Repositório**  
   Abra o terminal (ou Git Bash) e clone o repositório para o seu computador:
   ```bash
   git clone https://github.com/seu-usuario/gerenciador-despesas.git
