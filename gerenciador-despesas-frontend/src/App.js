// Importa as dependências necessárias
import { useEffect, useState } from 'react';
import axios from 'axios'; // Biblioteca para requisições HTTP
import { Pie, Bar, Line, Doughnut, Radar } from 'react-chartjs-2'; // Componentes de gráficos
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, RadialLinearScale, Filler as FillerElement, LineController, BarController, PieController, DoughnutController, RadarController } from 'chart.js'; // Elementos do Chart.js
import DatePicker from './DatePicker'; // Componente personalizado para seleção de datas
import ConfirmationPopup from './ConfirmationPopup'; // Componente para pop-up de confirmação
import 'flatpickr/dist/flatpickr.min.css'; // Estilo do Flatpickr (biblioteca de DatePicker)
import './App.css'; // Estilos da aplicação

// Registra todos os elementos necessários para os gráficos do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, RadialLinearScale, FillerElement, LineController, BarController, PieController, DoughnutController, RadarController);

// Configuração global para melhorar a resolução dos gráficos
ChartJS.defaults.set('devicePixelRatio', window.devicePixelRatio * 2 || 4);

// Componente principal da aplicação
function App() {
  // Estados para gerenciar transações e formulário
  const [transactions, setTransactions] = useState([]); // Lista de transações
  const [type, setType] = useState('expense'); // Tipo da transação (receita ou despesa)
  const [amount, setAmount] = useState(''); // Valor da transação
  const [category, setCategory] = useState(''); // Categoria da transação
  const [date, setDate] = useState(''); // Data da transação
  const [description, setDescription] = useState(''); // Descrição da transação
  const [editingId, setEditingId] = useState(null); // ID da transação sendo editada (se aplicável)

  // Estados para gerenciar os tipos de gráficos
  const [chartTypes, setChartTypes] = useState({
    income: 'pie',
    expense: 'doughnut',
    progress: 'bar',
    evolution: 'area',
    expensesByMonth: 'bar',
    incomeVsExpense: 'area'
  });

  // Estados para filtros do histórico de transações
  const [selectedMonth, setSelectedMonth] = useState(''); // Mês selecionado para filtro
  const [selectedType, setSelectedType] = useState(''); // Tipo selecionado para filtro
  const [selectedCategory, setSelectedCategory] = useState(''); // Categoria selecionada para filtro
  const [minAmount, setMinAmount] = useState(''); // Valor mínimo para filtro
  const [maxAmount, setMaxAmount] = useState(''); // Valor máximo para filtro
  const [startDate, setStartDate] = useState(''); // Data inicial para filtro
  const [endDate, setEndDate] = useState(''); // Data final para filtro
  const [searchDescription, setSearchDescription] = useState(''); // Texto de busca na descrição
  const [expandedMonth, setExpandedMonth] = useState(''); // Mês expandido no histórico

  // Estados para o pop-up de edição
  const [isEditing, setIsEditing] = useState(false); // Controla a visibilidade do modal de edição
  const [isClosing, setIsClosing] = useState(false); // Controla a animação de fechamento do modal
  const [editTransaction, setEditTransaction] = useState(null); // Transação sendo editada
  const [editType, setEditType] = useState(''); // Tipo da transação editada
  const [editAmount, setEditAmount] = useState(''); // Valor da transação editada
  const [editCategory, setEditCategory] = useState(''); // Categoria da transação editada
  const [editDate, setEditDate] = useState(''); // Data da transação editada
  const [editDescription, setEditDescription] = useState(''); // Descrição da transação editada

  // Estados para os pop-ups de confirmação de exclusão
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false); // Pop-up de exclusão de uma transação
  const [isDeleteAllPopupOpen, setIsDeleteAllPopupOpen] = useState(false); // Pop-up de exclusão de todas as transações
  const [transactionToDelete, setTransactionToDelete] = useState(null); // ID da transação a ser excluída

  // Hook useEffect para inicializar a aplicação
  // Reseta os estados dos pop-ups e busca as transações ao carregar a página
  useEffect(() => {
    setIsDeletePopupOpen(false);
    setIsDeleteAllPopupOpen(false);
    setIsEditing(false);
    setIsClosing(false);
    fetchTransactions();
  }, []);

  // Função para buscar transações do backend
  const fetchTransactions = () => axios.get('http://localhost:3001/api/transactions')
    .then((response) => {
      console.log('Dados recebidos do backend:', response.data);
      setTransactions(response.data);
    })
    .catch((error) => {
      console.error('Erro ao buscar transações:', error.message);
      console.error('Detalhes do erro:', error.response?.data);
    });

  // Função para lidar com o envio do formulário (adicionar/editar transação)
  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      alert('O valor deve ser maior que zero.');
      return;
    }
    const transactionData = { type, amount: parsedAmount, category, date: date || new Date().toISOString().split('T')[0], description };
    (editingId ? axios.put(`http://localhost:3001/api/transactions/${editingId}`, transactionData) : axios.post('http://localhost:3001/api/transactions', transactionData))
      .then(() => { fetchTransactions(); resetForm(); })
      .catch((error) => console.error(`Erro ao ${editingId ? 'editar' : 'adicionar'} transação:`, error));
  };

  // Função para iniciar a exclusão de uma transação
  const handleDelete = (id) => {
    console.log('handleDelete chamado com ID:', id);
    setTransactionToDelete(id);
    setIsDeletePopupOpen(true);
  };

  // Função para confirmar a exclusão de uma transação
  const confirmDelete = () => {
    console.log('Iniciando confirmDelete...');
    console.log('transactionToDelete:', transactionToDelete);
    if (!transactionToDelete) {
      console.error('Nenhuma transação selecionada para exclusão.');
      setIsDeletePopupOpen(false);
      return;
    }
    axios.delete(`http://localhost:3001/api/transactions/${transactionToDelete}`)
      .then((response) => {
        console.log('Transação excluída com sucesso:', response.data);
        fetchTransactions();
        setIsDeletePopupOpen(false);
        setTransactionToDelete(null);
      })
      .catch((error) => {
        console.error('Erro ao excluir transação:', error.message);
        console.error('Detalhes do erro:', error.response?.data);
        setIsDeletePopupOpen(false);
      });
  };

  // Função para iniciar a exclusão de todas as transações
  const handleDeleteAll = () => {
    console.log('handleDeleteAll chamado...');
    setIsDeleteAllPopupOpen(true);
  };

  // Função para confirmar a exclusão de todas as transações
  const confirmDeleteAll = () => {
    console.log('Iniciando confirmDeleteAll...');
    axios.delete('http://localhost:3001/api/transactions')
      .then((response) => {
        console.log('Todas as transações excluídas com sucesso:', response.data);
        setTransactions([]);
        setExpandedMonth('');
        setIsDeleteAllPopupOpen(false);
      })
      .catch((error) => {
        console.error('Erro ao apagar todas as transações:', error.message);
        console.error('Detalhes do erro:', error.response?.data);
        setIsDeleteAllPopupOpen(false);
      });
  };

  // Função para abrir o modal de edição com os dados da transação
  const handleEdit = (transaction) => {
    setIsEditing(true);
    setIsClosing(false);
    setEditTransaction(transaction);
    setEditType(transaction.type);
    setEditAmount(transaction.amount.toString());
    setEditCategory(transaction.category);
    setEditDate(transaction.date);
    setEditDescription(transaction.description || '');
  };

  // Função para lidar com o envio do formulário de edição
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const parsedEditAmount = parseFloat(editAmount);
    if (parsedEditAmount <= 0) {
      alert('O valor deve ser maior que zero.');
      return;
    }
    const updatedTransaction = {
      type: editType,
      amount: parsedEditAmount,
      category: editCategory,
      date: editDate || new Date().toISOString().split('T')[0],
      description: editDescription,
    };
    axios.put(`http://localhost:3001/api/transactions/${editTransaction.id}`, updatedTransaction)
      .then(() => {
        fetchTransactions();
        setIsClosing(true);
      })
      .catch((error) => console.error('Erro ao editar transação:', error));
  };

  // Função para fechar o modal de edição
  const closeEditModal = () => {
    setIsClosing(true);
  };

  // Hook useEffect para gerenciar o fechamento do modal de edição
  // Reseta os estados após a animação de fechamento (300ms)
  useEffect(() => {
    if (isClosing && isEditing) {
      const timer = setTimeout(() => {
        setIsEditing(false);
        setEditTransaction(null);
        setEditType('');
        setEditAmount('');
        setEditCategory('');
        setEditDate('');
        setEditDescription('');
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClosing, isEditing]);

  // Função para resetar o formulário principal
  const resetForm = () => {
    setEditingId(null);
    setType('expense');
    setAmount('');
    setCategory('');
    setDate('');
    setDescription('');
  };

  // Função para lidar com a mudança de tipo no formulário principal
  const handleTypeChange = (e) => {
    setType(e.target.value);
    setCategory('');
  };

  // Função para lidar com a mudança de tipo no formulário de edição
  const handleEditTypeChange = (e) => {
    setEditType(e.target.value);
    setEditCategory('');
  };

  // Função para formatar a data no formato DD/MM/YYYY
  const formatDate = (dateString) => {
    if (dateString.includes('/')) {
      return dateString;
    }
    return dateString.split('-').reverse().join('/');
  };

  // Cálculos financeiros
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const expensesCovered = Math.min(totalIncome, totalExpense);
  const expensesPending = totalExpense > totalIncome ? totalExpense - totalIncome : 0;
  const incomeNeeded = balance < 0 ? Math.abs(balance) : 0;

  // Função para gerar cores dinâmicas para os gráficos
  const generateColor = (index) => {
    let hue = (index * 137.508) % 360;
    return `hsl(${hue <= 15 || hue >= 345 ? 30 + ((hue + 15) % 300) : hue}, 70%, 50%)`;
  };

  // Função para escurecer uma cor (usada para bordas dos gráficos)
  const darkenColor = (color) => {
    if (color.startsWith('hsl')) {
      const hslMatch = color.match(/hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/);
      if (hslMatch) {
        const [, h, s, l] = hslMatch;
        const hue = parseFloat(h);
        const saturation = parseFloat(s);
        const lightness = parseFloat(l);
        const newLightness = Math.max(0, lightness - 20);
        return `hsl(${hue}, ${saturation}%, ${newLightness}%)`;
      }
    }
    if (color.startsWith('rgba')) {
      const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch;
        return `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
      }
    }
    if (color.startsWith('#')) {
      let hex = color.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map((char) => char + char).join('');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `#${Math.floor(r * 0.7).toString(16).padStart(2, '0')}${Math.floor(g * 0.7).toString(16).padStart(2, '0')}${Math.floor(b * 0.7).toString(16).padStart(2, '0')}`;
    }
    return color;
  };

  // Lista de todas as categorias únicas
  const allCategories = [...new Set(transactions.map((t) => t.category))];

  // Filtra as transações para o histórico com base nos filtros selecionados
  const filteredHistoryTransactions = selectedMonth || selectedType || selectedCategory || minAmount || maxAmount || startDate || endDate || searchDescription
    ? transactions.filter((t) => {
        const matchesMonth = selectedMonth ? (t.date.includes('/') ? `${t.date.split('/')[2]}-${t.date.split('/')[1].padStart(2, '0')}` : t.date.slice(0, 7)) === selectedMonth : true;
        const matchesType = selectedType ? t.type === selectedType : true;
        const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
        const matchesMinAmount = minAmount ? t.amount >= parseFloat(minAmount) : true;
        const matchesMaxAmount = maxAmount ? t.amount <= parseFloat(maxAmount) : true;
        const matchesStartDate = startDate ? new Date(t.date.includes('/') ? `${t.date.split('/')[2]}-${t.date.split('/')[1]}-${t.date.split('/')[0]}` : t.date) >= new Date(startDate) : true;
        const matchesEndDate = endDate ? new Date(t.date.includes('/') ? `${t.date.split('/')[2]}-${t.date.split('/')[1]}-${t.date.split('/')[0]}` : t.date) <= new Date(endDate) : true;
        const matchesDescription = searchDescription ? (t.description || '').toLowerCase().includes(searchDescription.toLowerCase()) : true;
        return matchesMonth && matchesType && matchesCategory && matchesMinAmount && matchesMaxAmount && matchesStartDate && matchesEndDate && matchesDescription;
      })
    : transactions;

  // Agrupa as transações por mês para o histórico
  const transactionsByMonth = filteredHistoryTransactions.reduce((acc, t) => {
    let month;
    if (t.date.includes('/')) {
      const [, monthPart, year] = t.date.split('/');
      month = `${year}-${monthPart.padStart(2, '0')}`;
    } else {
      month = t.date.slice(0, 7);
    }
    acc[month] = acc[month] || [];
    acc[month].push(t);
    return acc;
  }, {});
  const months = Object.keys(transactionsByMonth).sort();

  // Dados para os gráficos
  // Gráfico de Receitas por Categoria
  const incomeCategories = [...new Set(transactions.filter((t) => t.type === 'income').map((t) => t.category))];
  const incomeBackgroundColors = chartTypes.income === 'area' || chartTypes.income === 'radar' ? 'rgba(54, 162, 235, 0.3)' : incomeCategories.length > 0 ? incomeCategories.map((_, index) => generateColor(index)) : ['#36A2EB'];
  const incomeBorderColors = Array.isArray(incomeBackgroundColors) ? incomeBackgroundColors.map(darkenColor) : darkenColor(incomeBackgroundColors);
  const incomeData = {
    labels: incomeCategories.length > 0 ? incomeCategories : ['Sem Receitas'],
    datasets: [{
      label: 'Receitas',
      data: incomeCategories.length > 0 ? incomeCategories.map((cat) => transactions.filter((t) => t.type === 'income' && t.category === cat).reduce((sum, t) => sum + t.amount, 0)) : [0],
      backgroundColor: incomeBackgroundColors,
      borderColor: incomeBorderColors,
      borderWidth: 2,
      fill: chartTypes.income === 'area' || chartTypes.income === 'radar'
    }]
  };

  // Gráfico de Despesas vs. Saldo
  const expenseCategories = [...new Set(transactions.filter((t) => t.type === 'expense').map((t) => t.category))];
  const expenseBackgroundColors = chartTypes.expense === 'area' || chartTypes.expense === 'radar' ? 'rgba(255, 99, 132, 0.3)' : [...expenseCategories.map(() => '#FF6384'), balance > 0 ? '#4CAF50' : '#B0BEC5'];
  const expenseData = {
    labels: expenseCategories.length > 0 ? [...expenseCategories, 'Saldo'] : ['Sem Despesas', 'Saldo'],
    datasets: [{
      label: 'Despesas e Saldo',
      data: expenseCategories.length > 0 ? [...expenseCategories.map((cat) => transactions.filter((t) => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0)), balance >= 0 ? balance : 0] : [0, balance >= 0 ? balance : 0],
      backgroundColor: expenseBackgroundColors,
      borderColor: chartTypes.expense === 'pie' || chartTypes.expense === 'doughnut' || chartTypes.expense === 'bar' ? (Array.isArray(expenseBackgroundColors) ? expenseBackgroundColors.map(darkenColor) : darkenColor(expenseBackgroundColors)) : '#FF6384',
      borderWidth: chartTypes.expense === 'pie' || chartTypes.expense === 'doughnut' || chartTypes.expense === 'bar' ? 2 : 1,
      fill: chartTypes.expense === 'area' || chartTypes.expense === 'radar'
    }]
  };

  // Gráfico de Progresso Financeiro
  const progressBackgroundColors = chartTypes.progress === 'area' || chartTypes.progress === 'radar' ? 'rgba(54, 162, 235, 0.3)' : ['#36A2EB', '#4CAF50', '#FF6384'];
  const progressData = {
    labels: ['Receitas', 'Despesas Pagas', 'Despesas Pendentes'],
    datasets: [{
      label: 'Progresso Financeiro',
      data: [totalIncome, expensesCovered, expensesPending],
      backgroundColor: progressBackgroundColors,
      borderColor: chartTypes.progress === 'pie' || chartTypes.progress === 'doughnut' || chartTypes.progress === 'bar' ? (Array.isArray(progressBackgroundColors) ? progressBackgroundColors.map(darkenColor) : darkenColor(progressBackgroundColors)) : '#36A2EB',
      borderWidth: chartTypes.progress === 'pie' || chartTypes.progress === 'doughnut' || chartTypes.progress === 'bar' ? 2 : 1,
      fill: chartTypes.progress === 'area' || chartTypes.progress === 'radar'
    }]
  };

  // Gráfico de Variação do Saldo
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date.includes('/') ? `${a.date.split('/')[2]}-${a.date.split('/')[1]}-${a.date.split('/')[0]}` : a.date) - new Date(b.date.includes('/') ? `${b.date.split('/')[2]}-${b.date.split('/')[1]}-${b.date.split('/')[0]}` : b.date));
  const evolutionBackgroundColor = chartTypes.evolution === 'bar' ? '#4CAF50' : chartTypes.evolution === 'area' || chartTypes.evolution === 'radar' ? 'rgba(76, 175, 80, 0.3)' : chartTypes.evolution === 'pie' || chartTypes.evolution === 'doughnut' ? '#4CAF50' : 'rgba(76, 175, 80, 0.1)';
  const evolutionData = {
    labels: sortedTransactions.map((t) => formatDate(t.date)),
    datasets: [{
      label: 'Saldo ao Longo do Tempo',
      data: sortedTransactions.reduce((acc, t, index) => [...acc, (index === 0 ? 0 : acc[index - 1]) + (t.type === 'income' ? t.amount : -t.amount)], []),
      borderColor: chartTypes.evolution === 'pie' || chartTypes.evolution === 'doughnut' || chartTypes.evolution === 'bar' ? darkenColor(evolutionBackgroundColor) : '#4CAF50',
      backgroundColor: evolutionBackgroundColor,
      borderWidth: chartTypes.evolution === 'pie' || chartTypes.evolution === 'doughnut' || chartTypes.evolution === 'bar' ? 2 : 1,
      fill: chartTypes.evolution === 'area' || chartTypes.evolution === 'radar'
    }]
  };

  // Gráfico de Despesas por Mês
  const expensesByMonthBackgroundColor = chartTypes.expensesByMonth === 'area' || chartTypes.expensesByMonth === 'radar' ? 'rgba(255, 99, 132, 0.3)' : '#FF6384';
  const expensesByMonthData = {
    labels: months.length > 0 ? months : ['Sem Despesas'],
    datasets: [{
      label: 'Despesas por Mês',
      data: months.length > 0 ? months.map((month) => {
        const filtered = transactions.filter((t) => {
          const transactionMonth = t.date.includes('/') ? `${t.date.split('/')[2]}-${t.date.split('/')[1].padStart(2, '0')}` : t.date.slice(0, 7);
          return t.type === 'expense' && transactionMonth === month;
        });
        return filtered.reduce((sum, t) => sum + t.amount, 0);
      }) : [0],
      backgroundColor: expensesByMonthBackgroundColor,
      borderColor: chartTypes.expensesByMonth === 'pie' || chartTypes.expensesByMonth === 'doughnut' || chartTypes.expensesByMonth === 'bar' ? darkenColor(expensesByMonthBackgroundColor) : '#FF6384',
      borderWidth: chartTypes.expensesByMonth === 'pie' || chartTypes.expensesByMonth === 'doughnut' || chartTypes.expensesByMonth === 'bar' ? 2 : 1,
      fill: chartTypes.expensesByMonth === 'area' || chartTypes.expensesByMonth === 'radar'
    }]
  };

  // Gráfico de Receitas vs. Despesas
  const incomeVsExpenseBackgroundColors = [chartTypes.incomeVsExpense === 'area' || chartTypes.incomeVsExpense === 'radar' ? 'rgba(54, 162, 235, 0.3)' : '#36A2EB', chartTypes.incomeVsExpense === 'area' || chartTypes.incomeVsExpense === 'radar' ? 'rgba(255, 99, 132, 0.3)' : '#FF6384'];
  const incomeVsExpenseData = {
    labels: allCategories.length > 0 ? allCategories : ['Sem Dados'],
    datasets: [
      {
        label: 'Receitas',
        data: allCategories.length > 0 ? allCategories.map((cat) => transactions.filter((t) => t.type === 'income' && t.category === cat).reduce((sum, t) => sum + t.amount, 0)) : [0],
        backgroundColor: incomeVsExpenseBackgroundColors[0],
        borderColor: chartTypes.incomeVsExpense === 'pie' || chartTypes.incomeVsExpense === 'doughnut' || chartTypes.incomeVsExpense === 'bar' ? darkenColor(incomeVsExpenseBackgroundColors[0]) : '#36A2EB',
        borderWidth: chartTypes.incomeVsExpense === 'pie' || chartTypes.incomeVsExpense === 'doughnut' || chartTypes.incomeVsExpense === 'bar' ? 2 : 1,
        fill: chartTypes.incomeVsExpense === 'area' || chartTypes.incomeVsExpense === 'radar',
      },
      {
        label: 'Despesas',
        data: allCategories.length > 0 ? allCategories.map((cat) => transactions.filter((t) => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0)) : [0],
        backgroundColor: incomeVsExpenseBackgroundColors[1],
        borderColor: chartTypes.incomeVsExpense === 'pie' || chartTypes.incomeVsExpense === 'doughnut' || chartTypes.incomeVsExpense === 'bar' ? darkenColor(incomeVsExpenseBackgroundColors[1]) : '#FF6384',
        borderWidth: chartTypes.incomeVsExpense === 'pie' || chartTypes.incomeVsExpense === 'doughnut' || chartTypes.incomeVsExpense === 'bar' ? 2 : 1,
        fill: chartTypes.incomeVsExpense === 'area' || chartTypes.incomeVsExpense === 'radar',
      }
    ]
  };

  // Opções gerais para os gráficos
  const chartOptions = (type, backgroundColors) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 15,
          font: { size: 14 },
          color: '#fff',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.label === 'Receitas' ? totalIncome : totalExpense;
            return `${context.label}: R$${context.raw.toFixed(2)} (${total > 0 ? ((context.raw / total) * 100).toFixed(2) : 0}%)`;
          },
        },
      },
    },
    ...(type === 'pie' || type === 'doughnut' ? { elements: { arc: { borderWidth: 2, borderColor: Array.isArray(backgroundColors) ? backgroundColors.map(darkenColor) : darkenColor(backgroundColors) } } } : {}),
    ...(type === 'bar' ? { elements: { bar: { borderWidth: 2, borderColor: Array.isArray(backgroundColors) ? backgroundColors.map(darkenColor) : darkenColor(backgroundColors) } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 14 }, color: '#fff' } }, x: { ticks: { font: { size: 14 }, color: '#fff' } } } } : {}),
    ...(type === 'line' || type === 'area' ? { scales: { y: { beginAtZero: true, ticks: { font: { size: 14 }, color: '#fff' } }, x: { ticks: { font: { size: 14 }, maxRotation: 45, minRotation: 45, color: '#fff' } } } } : {}),
    ...(type === 'radar' ? { scales: { r: { beginAtZero: true, ticks: { font: { size: 14 }, color: '#fff' } } } } : {}),
  });

  // Opções específicas para gráficos de linha/área
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 15,
          font: { size: 14 },
          color: '#fff',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Saldo: R$${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 14 }, color: '#fff' } },
      x: { ticks: { font: { size: 14 }, maxRotation: 45, minRotation: 45, color: '#fff' } },
    },
  };

  // Função para renderizar o gráfico com base no tipo
  const renderChart = (type, data, options) => {
    switch (type) {
      case 'pie': return <Pie data={data} options={options} />;
      case 'bar': return <Bar data={data} options={options} />;
      case 'line': return <Line data={data} options={options} />;
      case 'doughnut': return <Doughnut data={data} options={options} />;
      case 'area': return <Line data={data} options={options} />;
      case 'radar': return <Radar data={data} options={options} />;
      default: return null;
    }
  };

  // Renderização do componente
  return (
    <div className="App">
      {/* Cabeçalho com formulário para adicionar transações */}
      <header className="glass-section">
        <h1>Gerenciador de Despesas Pessoais</h1>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <select value={type} onChange={handleTypeChange}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
            <input type="number" placeholder="Valor" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <input type="text" placeholder="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <DatePicker id="main-date" value={date} onChange={setDate} />
            <input type="text" placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button type="submit">Adicionar</button>
          </form>
          <button className="delete-all" onClick={handleDeleteAll}>Apagar Tudo</button>
        </div>
        {/* Controles para selecionar o tipo de gráfico */}
        <div className="controls">
          {['income', 'expense', 'progress', 'evolution', 'expensesByMonth', 'incomeVsExpense'].map((key) => (
            <div className="chart-control" key={key}>
              <label>{key === 'income' ? 'Receitas' : key === 'expense' ? 'Despesas' : key === 'progress' ? 'Progresso' : key === 'evolution' ? 'Evolução' : key === 'expensesByMonth' ? 'Despesas por Mês' : 'Receitas vs. Despesas'}: </label>
              <select value={chartTypes[key]} onChange={(e) => setChartTypes({ ...chartTypes, [key]: e.target.value })}>
                <option value="pie">Pizza</option>
                <option value="doughnut">Rosca</option>
                <option value="bar">Barras</option>
                <option value="line">Linhas</option>
                <option value="area">Área</option>
                <option value="radar">Radar</option>
              </select>
            </div>
          ))}
        </div>
      </header>

      {/* Container principal com sidebar e conteúdo */}
      <div className="main-container">
        {/* Sidebar com resumo financeiro */}
        <aside className="sidebar glass-section">
          <div className="summary">
            <h2>Resumo Financeiro</h2>
            <p className="income">Receitas: R${totalIncome.toFixed(2)}</p>
            <p className="expense">Despesas: R${totalExpense.toFixed(2)}</p>
            <p className="covered">Despesas Pagas: R${expensesCovered.toFixed(2)}</p>
            <p className="pending">Despesas Pendentes: R${expensesPending.toFixed(2)}</p>
            {incomeNeeded > 0 && <p className="needed">Receita Necessária: R${(incomeNeeded).toFixed(2)}</p>}
            <p className={balance >= 0 ? 'positive' : 'negative'}>Saldo: R${balance.toFixed(2)}</p>
          </div>
        </aside>

        {/* Conteúdo principal com gráficos e histórico */}
        <main className="content">
          {/* Primeira linha de gráficos */}
          <div className="charts-container">
            <div className="chart glass-section" key={`income-${chartTypes.income}`}>
              <h2>Receitas por Categoria</h2>
              {renderChart(chartTypes.income, incomeData, chartOptions(chartTypes.income, incomeBackgroundColors))}
            </div>
            <div className="chart glass-section" key={`expense-${chartTypes.expense}`}>
              <h2>Despesas vs. Saldo</h2>
              {renderChart(chartTypes.expense, expenseData, chartOptions(chartTypes.expense, expenseBackgroundColors))}
            </div>
            <div className="chart glass-section" key={`progress-${chartTypes.progress}`}>
              <h2>Pagamento de Despesas</h2>
              {renderChart(chartTypes.progress, progressData, chartOptions(chartTypes.progress, progressBackgroundColors))}
            </div>
          </div>

          {/* Segunda linha de gráficos */}
          <div className="charts-container">
            <div className="chart glass-section" key={`evolution-${chartTypes.evolution}`}>
              <h2>Variação do Saldo</h2>
              {renderChart(chartTypes.evolution, evolutionData, chartTypes.evolution === 'line' || chartTypes.evolution === 'area' ? lineOptions : chartOptions(chartTypes.evolution, evolutionBackgroundColor))}
            </div>
            <div className="chart glass-section" key={`expensesByMonth-${chartTypes.expensesByMonth}`}>
              <h2>Gastos Mensais</h2>
              {renderChart(chartTypes.expensesByMonth, expensesByMonthData, chartOptions(chartTypes.expensesByMonth, expensesByMonthBackgroundColor))}
            </div>
            <div className="chart glass-section" key={`incomeVsExpense-${chartTypes.incomeVsExpense}`}>
              <h2>Receitas vs. Despesas</h2>
              {renderChart(chartTypes.incomeVsExpense, incomeVsExpenseData, chartOptions(chartTypes.incomeVsExpense, incomeVsExpenseBackgroundColors))}
            </div>
          </div>

          {/* Seção de histórico de transações */}
          <div className="transactions-container glass-section">
            {/* Filtros para o histórico */}
            <div className="filter-container">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Filtrar por Mês: </label>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="">Todos os Meses</option>
                    {months.map((month) => <option key={month} value={month}>{month}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Filtrar por Tipo: </label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="">Todas as Transações</option>
                    <option value="income">Receitas</option>
                    <option value="expense">Despesas</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Filtrar por Categoria: </label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">Todas as Categorias</option>
                    {allCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Buscar na Descrição: </label>
                  <input
                    type="text"
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
                    placeholder="Pagamento"
                  />
                </div>
              </div>
              <div className="filter-row-with-button">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Valor Mínimo: </label>
                    <input
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Valor Máximo: </label>
                    <input
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Data Inicial: </label>
                    <DatePicker id="start-date" value={startDate} onChange={setStartDate} />
                  </div>
                  <div className="filter-group">
                    <label>Data Final: </label>
                    <DatePicker id="end-date" value={endDate} onChange={setEndDate} />
                  </div>
                </div>
                <button className="clear-filters" onClick={() => {
                  setSelectedMonth('');
                  setSelectedType('');
                  setSelectedCategory('');
                  setMinAmount('');
                  setMaxAmount('');
                  setStartDate('');
                  setEndDate('');
                  setSearchDescription('');
                }}>
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Lista de transações agrupadas por mês */}
            <h2>Transações</h2>
            {months.map((month) => (
              <div key={month} className="month-section">
                <h3>{month} <button onClick={() => setExpandedMonth(expandedMonth === month ? '' : month)}>{expandedMonth === month ? 'Ocultar' : 'Detalhar'}</button></h3>
                {expandedMonth === month && (
                  <ul>
                    {transactionsByMonth[month].map((transaction) => (
                      <li key={transaction.id} className={transaction.type === 'income' ? 'income' : 'expense'}>
                        {transaction.type === 'expense' ? 'Despesa' : 'Receita'} - R${transaction.amount.toFixed(2)} - {transaction.category} - {formatDate(transaction.date)}{transaction.description && ` - ${transaction.description}`}
                        <div>
                          <button onClick={() => handleEdit(transaction)} aria-label={`Editar transação de ${transaction.category} em ${formatDate(transaction.date)}`}>Editar</button>
                          <button onClick={() => handleDelete(transaction.id)} aria-label={`Excluir transação de ${transaction.category} em ${formatDate(transaction.date)}`}>Excluir</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal de edição de transações */}
      {isEditing && (
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
          <div className={`modal glass-section ${isClosing ? 'closing' : ''}`}>
            <h2>Editar Transação</h2>
            <form onSubmit={handleEditSubmit}>
              <select value={editType} onChange={handleEditTypeChange}>
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
              <input
                type="number"
                placeholder="Valor"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Categoria"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                required
              />
              <DatePicker id="edit-date" value={editDate} onChange={setEditDate} />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <div className="modal-buttons">
                <button type="submit" aria-label="Salvar alterações da transação">Salvar</button>
                <button type="button" onClick={closeEditModal} aria-label="Cancelar edição da transação">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up de confirmação para exclusão de uma transação */}
      <ConfirmationPopup
        isOpen={isDeletePopupOpen}
        onClose={() => {
          setIsDeletePopupOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={confirmDelete}
        message="Tem certeza que deseja excluir esta transação?"
      />

      {/* Pop-up de confirmação para exclusão de todas as transações */}
      <ConfirmationPopup
        isOpen={isDeleteAllPopupOpen}
        onClose={() => setIsDeleteAllPopupOpen(false)}
        onConfirm={confirmDeleteAll}
        message="Tem certeza que deseja apagar TODAS as transações? Esta ação não pode ser desfeita."
      />
    </div>
  );
}

// Exporta o componente App para uso no React
export default App;