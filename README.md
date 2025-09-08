# 📊 Gerenciador de Despesas Pessoais

**Um aplicativo web full-stack, construído com React e Node.js, para ajudar os utilizadores a controlar as suas finanças de forma simples e eficiente.**

---

## 📝 Descrição do Projeto

O Gerenciador de Despesas Pessoais é uma aplicação web desenvolvida para ajudar os utilizadores a controlar as suas finanças. Com uma interface intuitiva e um design moderno com efeito "glassmorphism", a app permite adicionar, editar e excluir transações (receitas e despesas), visualizar um resumo financeiro e analisar os dados através de gráficos interativos.

Além das funcionalidades básicas, o projeto inclui um sistema de gestão de status de pagamento (Pago/Pendente), criação de despesas parceladas e projeção de receitas recorrentes, transformando-o numa poderosa ferramenta de planeamento financeiro.

## ✨ Funcionalidades Principais

* **Autenticação Segura:** Registo de utilizadores com senhas criptografadas e login baseado em tokens JWT, com um ecrã de login imersivo.
* **Resumo Financeiro Detalhado:** Veja o total de receitas, despesas pagas, contas pendentes, saldo atual e saldo projetado.
* **Gráficos Interativos:** Visualize as suas finanças com gráficos personalizáveis (pizza, rosca, barras, linhas, etc.) para:
    * Receitas por categoria
    * Despesas vs. Saldo
    * Progresso de pagamento de despesas
    * Variação do saldo ao longo do tempo
* **Histórico de Transações:** Liste todas as transações, agrupadas por mês, com filtros por data, tipo, categoria e descrição.
* **Gestão de Status:** Alterne facilmente as despesas entre "Paga" e "Pendente" diretamente na lista.
* **Funcionalidades de Planeamento:**
    * **Despesas Parceladas:** Adicione uma compra parcelada e o sistema cria as futuras cobranças automaticamente.
    * **Receitas Recorrentes:** Projete rendas fixas (como salários) para os próximos meses.
* **Toques Pessoais:** Receba uma mensagem de feliz aniversário ao fazer login no dia do seu aniversário!

## 🛠️ Tecnologias Utilizadas

#### **Frontend:**
* React
* React Router
* Axios
* Chart.js & react-chartjs-2
* CSS Modules & CSS Moderno (Flexbox, Grid)

#### **Backend:**
* Node.js
* Express.js
* SQLite3
* JSON Web Tokens (JWT)
* bcrypt.js
* uuid

---

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para rodar o projeto na sua máquina.

### **Pré-requisitos**

* Node.js e npm instalados.
* Git instalado para clonar o repositório.

### **Passo a Passo**

**1. Clone o Repositório**
Abra o terminal e clone o repositório para o seu computador:
```bash
git clone [https://github.com/Skidur/Gerenciador-Despesas.git](https://github.com/Skidur/Gerenciador-Despesas.git)