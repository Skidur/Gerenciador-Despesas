import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../api/apiService'; 
import { useAuth } from '../../contexts/AuthContext';
import { Pie, Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, RadialLinearScale, Filler as FillerElement, LineController, BarController, PieController, DoughnutController, RadarController } from 'chart.js';
import { format, getMonth, getYear, parseISO } from 'date-fns';

import DatePicker from '../../components/DatePicker/DatePicker';
import ConfirmationPopup from '../../components/ConfirmationPopup/ConfirmationPopup';
import 'flatpickr/dist/flatpickr.min.css';
import '../../App.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, RadialLinearScale, FillerElement, LineController, BarController, PieController, DoughnutController, RadarController);

ChartJS.defaults.set('devicePixelRatio', window.devicePixelRatio * 2 || 4);

function DashboardPage() {
  const { logOut, user, isBirthday } = useAuth();
  const [transactions, setTransactions] = useState([]);

  const [chartTypes, setChartTypes] = useState({
    income: 'pie',
    expense: 'doughnut',
    progress: 'bar',
    evolution: 'area',
    expensesByMonth: 'bar',
    incomeVsExpense: 'area'
  });

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [expandedMonth, setExpandedMonth] = useState('');

  const [showBirthdayModal, setShowBirthdayModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [editType, setEditType] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false); 
  const [isDeleteAllPopupOpen, setIsDeleteAllPopupOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);

  const [expenseData, setExpenseData] = useState({
    amount: '',
    category: '',
    date: '',
    description: ''
  });
  const [isPending, setIsPending] = useState(false);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringData, setRecurringData] = useState({
      repeatCount: '',
      dayOfMonth: ''
  });

  const [installmentData, setInstallmentData] = useState({
      description: '',
      category: '',
      amount: '',
      installments: '',
      startDate: ''
  });

  const [incomeData, setIncomeData] = useState({
    amount: '',
    category: '',
    date: '',
    description: ''
  });

    const fetchTransactions = useCallback(() => {
    api.get('/transactions')
    .then((response) => {
      console.log('Dados recebidos do backend:', response.data);
      setTransactions(response.data);
    })
    .catch((error) => {
      console.error('Erro ao buscar transações:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Token inválido ou expirado. Deslogando...');
        logOut();
      }
    });
}, [logOut]);

  useEffect(() => {
    setIsDeletePopupOpen(false);
    setIsDeleteAllPopupOpen(false);
    setIsEditing(false);
    setIsClosing(false);
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (isBirthday) {
        setShowBirthdayModal(true);
    }
  }, [isBirthday]);

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (parseFloat(expenseData.amount) <= 0) {
        alert('O valor deve ser maior que zero.');
        return;
    }
    try {
        await api.post('/transactions', {
            ...expenseData,
            type: 'expense',
            amount: parseFloat(expenseData.amount),
            status: isPending ? 'pendente' : 'pago',
        });

        setIsExpenseModalOpen(false);
        setExpenseData({ amount: '', category: '', date: '', description: '' });
        setIsPending(false);
        fetchTransactions();
    } catch (error) {
        console.error('Erro ao adicionar despesa:', error);
        alert('Erro ao adicionar despesa.');
    }
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInstallment = async (e) => {
      e.preventDefault();
      try {
          await api.post('/transactions/installments', {
              ...installmentData,
              amount: parseFloat(installmentData.amount),
              installments: parseInt(installmentData.installments, 10) 
          });

          setIsInstallmentModalOpen(false);
          setInstallmentData({ description: '', category: '', amount: '', installments: '', startDate: '' });
          fetchTransactions();
      } catch (error) {
          console.error('Erro ao adicionar parcelamento:', error);
          alert('Erro ao adicionar parcelamento. Verifique os dados e tente novamente.');
      }
  };

  const handleInstallmentChange = (e) => {
    const { name, value } = e.target;
    setInstallmentData(prevData => ({
        ...prevData,
        [name]: value
    }));
  };

  const handleIncomeChange = (e) => {
    const { name, value } = e.target;
    setIncomeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitIncome = async (e) => {
    e.preventDefault();
    if (parseFloat(incomeData.amount) <= 0) {
        alert('O valor deve ser maior que zero.');
        return;
    }

    try {
        if (isRecurring) {
            await api.post('/transactions/recurring-income', {
                ...incomeData,
                ...recurringData,
                amount: parseFloat(incomeData.amount),
                repeatCount: parseInt(recurringData.repeatCount, 10),
                dayOfMonth: parseInt(recurringData.dayOfMonth, 10),
            });
        } else {
            await api.post('/transactions', {
                ...incomeData,
                type: 'income',
                amount: parseFloat(incomeData.amount),
                status: 'pago',
            });
        }

        setIsIncomeModalOpen(false);
        setIncomeData({ amount: '', category: '', date: '', description: '' });
        setIsRecurring(false);
        setRecurringData({ repeatCount: '', dayOfMonth: '' });
        fetchTransactions();
    } catch (error) {
        console.error('Erro ao adicionar receita:', error);
        alert('Erro ao adicionar receita. Verifique todos os campos.');
    }
  };

  const handleMarkAsPending = (transactionId) => {
    api.patch(`/transactions/${transactionId}/pendente`)
        .then(() => {
            fetchTransactions();
        })
        .catch((error) => {
            console.error('Erro ao marcar como pendente:', error);
        });
  };

  const handleDelete = (id) => {
    console.log('handleDelete chamado com ID:', id);
    setTransactionToDelete(id);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = () => {
    console.log('Iniciando confirmDelete...');
    console.log('transactionToDelete:', transactionToDelete);
    if (!transactionToDelete) {
      console.error('Nenhuma transação selecionada para exclusão.');
      setIsDeletePopupOpen(false);
      return;
    }
    api.delete(`/transactions/${transactionToDelete}`)
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

  const handleDeleteAll = () => {
    console.log('handleDeleteAll chamado...');
    setIsDeleteAllPopupOpen(true);
  };

  const confirmDeleteAll = () => {
    console.log('Iniciando confirmDeleteAll...');
    api.delete('/transactions')
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

  const handleMarkAsPaid = (transactionId) => {
    api.patch(`/transactions/${transactionId}/pago`)
        .then(() => {
            fetchTransactions();
        })
        .catch((error) => {
            console.error('Erro ao marcar como pago:', error);
        });
  };

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
    api.put(`/transactions/${editTransaction.id}`, updatedTransaction)
      .then(() => {
        fetchTransactions();
        setIsClosing(true);
      })
      .catch((error) => console.error('Erro ao editar transação:', error));
  };

  const closeEditModal = () => {
    setIsClosing(true);
  }
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

  const handleEditTypeChange = (e) => {
    setEditType(e.target.value);
    setEditCategory('');
  };

  const handleRecurringChange = (e) => {
    const { name, value } = e.target;
    setRecurringData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    if (dateString.includes('/')) {
      return dateString;
    }
    return dateString.split('-').reverse().join('/');
  };

  const financialSummary = useMemo(() => {
    const now = new Date();
    const currentMonth = getMonth(now);
    const currentYear = getYear(now);

    const transactionsInCurrentMonth = transactions.filter(t => {
      try {
        const transactionDate = parseISO(t.date);
        return getYear(transactionDate) === currentYear && getMonth(transactionDate) === currentMonth;
      } catch (e) {
        return false;
      }
    });

    const incomeThisMonth = transactionsInCurrentMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const paidExpensesThisMonth = transactionsInCurrentMonth.filter(t => t.type === 'expense' && t.status === 'pago').reduce((sum, t) => sum + t.amount, 0);
    const pendingExpensesThisMonth = transactionsInCurrentMonth.filter(t => t.type === 'expense' && t.status === 'pendente').reduce((sum, t) => sum + t.amount, 0);
    const currentMonthBalance = incomeThisMonth - paidExpensesThisMonth;

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalPaidExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'pago').reduce((sum, t) => sum + t.amount, 0);
    const totalPendingExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'pendente').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = totalPaidExpenses + totalPendingExpenses;
    const projectedBalance = totalIncome - totalExpenses;

    return {
      currentMonthName: format(now, 'MMMM'),
      incomeThisMonth,
      paidExpensesThisMonth,
      pendingExpensesThisMonth,
      currentMonthBalance,
      totalIncome,
      totalExpenses,
      totalPaidExpenses,
      totalPendingExpenses,
      projectedBalance
    };
  }, [transactions]);

  const generateColor = useCallback((index) => {
    let hue = (index * 137.508) % 360;
    return `hsl(${hue <= 15 || hue >= 345 ? 30 + ((hue + 15) % 300) : hue}, 70%, 50%)`;
}, []);

const darkenColor = useCallback((color) => {
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
  }, []);

  const allCategories = [...new Set(transactions.map((t) => t.category))];

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

  const incomeCategories = [...new Set(transactions.filter((t) => t.type === 'income').map((t) => t.category))];
  const incomeBackgroundColors = chartTypes.income === 'area' || chartTypes.income === 'radar' ? 'rgba(54, 162, 235, 0.3)' : incomeCategories.length > 0 ? incomeCategories.map((_, index) => generateColor(index)) : ['#36A2EB'];
  const incomeBorderColors = Array.isArray(incomeBackgroundColors) ? incomeBackgroundColors.map(darkenColor) : darkenColor(incomeBackgroundColors);
  const incomeChartData = {
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

  const expenseChartData = useMemo(() => {
    const expenseCategories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
    
    const expenseDataForChart = expenseCategories.map(cat => 
      transactions
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const expenseColors = expenseCategories.map((_, index) => generateColor(index));
    
    const labels = [...expenseCategories, 'Saldo'];
    const data = [...expenseDataForChart, (financialSummary.projectedBalance > 0 ? financialSummary.projectedBalance : 0)];
    const backgroundColor = [...expenseColors, '#4CAF50'];

    return {
      labels,
      datasets: [{
        label: 'Despesas vs. Saldo',
        data,
        backgroundColor,
        borderColor: backgroundColor.map(color => darkenColor(color)),
        borderWidth: 2,
      }],
    };
  }, [transactions, financialSummary.projectedBalance, generateColor, darkenColor]);

  const progressBackgroundColors = chartTypes.progress === 'area' || chartTypes.progress === 'radar' ? 'rgba(54, 162, 235, 0.3)' : ['#36A2EB', '#4CAF50', '#FF6384'];
  const progressData = {
    labels: ['Receitas', 'Despesas Pagas', 'Despesas Pendentes'],
    datasets: [{
        label: 'Progresso Financeiro',
        data: [
            financialSummary.totalIncome, 
            financialSummary.totalPaidExpenses,
            financialSummary.totalPendingExpenses
        ],
      backgroundColor: progressBackgroundColors,
      borderColor: chartTypes.progress === 'pie' || chartTypes.progress === 'doughnut' || chartTypes.progress === 'bar' ? (Array.isArray(progressBackgroundColors) ? progressBackgroundColors.map(darkenColor) : darkenColor(progressBackgroundColors)) : '#36A2EB',
      borderWidth: chartTypes.progress === 'pie' || chartTypes.progress === 'doughnut' || chartTypes.progress === 'bar' ? 2 : 1,
      fill: chartTypes.progress === 'area' || chartTypes.progress === 'radar'
    }]
  };

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
            const totalAllExpenses = financialSummary.totalExpenses;
            const total = context.dataset.label === 'Receitas' ? financialSummary.totalIncome : totalAllExpenses;
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

  return (
    <div className="App">
      <header className="glass-section">
        <h1>Gerenciador de Despesas Pessoais de {user ? user.username : 'Usuário'}</h1>
        <button className="delete-all" onClick={logOut} style={{ position: 'absolute', top: '20px', right: '20px' }}>Sair</button>
          <div className="control-panel">
            <div className="main-actions">
              <button className="btn-action-receita" onClick={() => setIsIncomeModalOpen(true)}>
                  Nova Receita
              </button>
              <button className="btn-action-despesa" onClick={() => setIsExpenseModalOpen(true)}>
                Nova Despesa
              </button>
              <button className="btn-action-parcelamento" onClick={() => setIsInstallmentModalOpen(true)}>
                Adicionar Parcelamento
              </button>
            </div>
            <div className="secondary-actions">
              <button className="delete-all" onClick={handleDeleteAll}>
                  Apagar Tudo
              </button>
            </div>
          </div>
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

      <div className="main-container">
        <aside className="sidebar glass-section">
          <div className="summary">
            <h2>Resumo ({financialSummary.currentMonthName})</h2>
            <p className="income">Receitas do Mês: R${financialSummary.incomeThisMonth.toFixed(2)}</p>
            <p className="expense">Despesas Pagas: R${financialSummary.paidExpensesThisMonth.toFixed(2)}</p>
            <p className="pending">Contas Pendentes: R${financialSummary.pendingExpensesThisMonth.toFixed(2)}</p>
            <p className={financialSummary.currentMonthBalance >= 0 ? 'positive' : 'negative'}>
              <strong>Saldo Atual do Mês: R${financialSummary.currentMonthBalance.toFixed(2)}</strong>
            </p>
            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '15px 0' }} />
            <h2>Resumo Geral</h2>
            <p className="income">Receitas Totais: R${financialSummary.totalIncome.toFixed(2)}</p>
            <p className="expense">Despesas Totais: R${financialSummary.totalExpenses.toFixed(2)}</p>
            <p className={financialSummary.projectedBalance >= 0 ? 'positive' : 'negative'}>
              <strong>Saldo Projetado Final: R${financialSummary.projectedBalance.toFixed(2)}</strong>
            </p>
          </div>
        </aside>

        <main className="content">
          <div className="charts-container">
            <div className="chart glass-section" key={`income-${chartTypes.income}`}>
              <h2>Receitas por Categoria</h2>
              {renderChart(chartTypes.income, incomeChartData, chartOptions(chartTypes.income, incomeBackgroundColors))}
            </div>
            <div className="chart glass-section" key={`expense-${chartTypes.expense}`}>
              <h2>Despesas vs. Saldo</h2>
              {renderChart(chartTypes.expense, expenseChartData, chartOptions(chartTypes.expense, expenseChartData.datasets[0].backgroundColor))}
            </div>
            <div className="chart glass-section" key={`progress-${chartTypes.progress}`}>
              <h2>Pagamento de Despesas</h2>
              {renderChart(chartTypes.progress, progressData, chartOptions(chartTypes.progress, progressBackgroundColors))}
            </div>
          </div>

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

          <div className="transactions-container glass-section">
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
                    <div className="datepicker-with-icon">
                      <DatePicker id="start-date" value={startDate} onChange={setStartDate} />
                    </div>
                  </div>
                  <div className="filter-group">
                    <label>Data Final: </label>
                    <div className="datepicker-with-icon">
                      <DatePicker id="end-date" value={endDate} onChange={setEndDate} />
                    </div>
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

            <h2>Transações</h2>
            {months.map((month) => (
              <div key={month} className="month-section">
                <h3>{month} <button onClick={() => setExpandedMonth(expandedMonth === month ? '' : month)}>{expandedMonth === month ? 'Ocultar' : 'Detalhar'}</button></h3>
                {expandedMonth === month && (
                  <ul>
                    {transactionsByMonth[month].map((transaction) => (
                      <li key={transaction.id} className={transaction.type === 'income' ? 'income' : `expense ${transaction.status === 'pendente' ? 'pending' : ''}`}>
                        <span>
                            {transaction.type === 'expense' && (
                                <strong style={{ 
                                    color: transaction.status === 'pendente' ? '#FF9800' : '#4CAF50', 
                                    marginRight: '8px' 
                                }}>
                                    {transaction.status === 'pendente' ? '[PENDENTE]' : '[PAGO]'}
                                </strong>
                            )}

                            {transaction.type === 'expense' ? 'Despesa' : 'Receita'} - R${transaction.amount.toFixed(2)} - {transaction.category} - {formatDate(transaction.date)}{transaction.description && ` - ${transaction.description}`}
                        </span>

                        <div>
                          {transaction.type === 'expense' && (
                              transaction.status === 'pendente' ? (
                                  <button 
                                      onClick={() => handleMarkAsPaid(transaction.id)} 
                                      className="btn-status-pago"
                                      aria-label={`Marcar como paga a transação de ${transaction.category}`}
                                  >
                                      Marcar como Pago
                                  </button>
                              ) : (
                                  <button 
                                      onClick={() => handleMarkAsPending(transaction.id)} 
                                      className="btn-status-pendente"
                                      aria-label={`Marcar como pendente a transação de ${transaction.category}`}
                                  >
                                      Marcar como Pendente
                                  </button>
                              )
                          )}

                          <button className="btn-edit" onClick={() => handleEdit(transaction)}>Editar</button>
                          <button className="btn-delete" onClick={() => handleDelete(transaction.id)}>Excluir</button>
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

      {isInstallmentModalOpen && (
        <div className="modal-overlay">
            <div className="modal glass-section">
                <h2>Adicionar Compra Parcelada</h2>
                <form onSubmit={handleAddInstallment}>
                    <input
                        type="text"
                        name="description"
                        placeholder="Descrição (ex: Tênis Novo)"
                        value={installmentData.description}
                        onChange={handleInstallmentChange}
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="Categoria"
                        value={installmentData.category}
                        onChange={handleInstallmentChange}
                        required
                    />
                    <input
                        type="number"
                        name="amount"
                        placeholder="Valor de cada Parcela"
                        value={installmentData.amount}
                        onChange={handleInstallmentChange}
                        required
                    />
                    <input
                        type="number"
                        name="installments"
                        placeholder="Número de Parcelas"
                        value={installmentData.installments}
                        onChange={handleInstallmentChange}
                        required
                    />
                    <DatePicker
                        id="installment-start-date"
                        name="startDate"
                        value={installmentData.startDate}
                        onChange={(date) => setInstallmentData(prev => ({...prev, startDate: date}))}
                        placeholderText="Data da Primeira Parcela"
                        required
                    />
                    <div className="modal-buttons">
                        <button type="submit">Adicionar Parcelas</button>
                        <button type="button" onClick={() => setIsInstallmentModalOpen(false)}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {isExpenseModalOpen && (
          <div className="modal-overlay">
              <div className="modal glass-section">
                  <h2>Adicionar Nova Despesa</h2>
                  <form onSubmit={handleSubmitExpense}>
                      <input
                          type="number"
                          name="amount"
                          placeholder="Valor"
                          value={expenseData.amount}
                          onChange={handleExpenseChange}
                          required
                      />
                      <input
                          type="text"
                          name="category"
                          placeholder="Categoria (ex: Supermercado)"
                          value={expenseData.category}
                          onChange={handleExpenseChange}
                          required
                      />
                      <DatePicker
                          id="expense-date"
                          value={expenseData.date}
                          onChange={(date) => setExpenseData(prev => ({ ...prev, date: date }))}
                          placeholderText="Data da Despesa"
                          required
                      />
                      <input
                          type="text"
                          name="description"
                          placeholder="Descrição (opcional)"
                          value={expenseData.description}
                          onChange={handleExpenseChange}
                      />

                      <div className="checkbox-container">
                          <input 
                              type="checkbox" 
                              id="isPendingCheckbox"
                              checked={isPending}
                              onChange={(e) => setIsPending(e.target.checked)}
                          />
                          <label htmlFor="isPendingCheckbox">Marcar como Pendente (não paga)</label>
                      </div>

                      <div className="modal-buttons">
                          <button type="submit">Adicionar Despesa</button>
                          <button type="button" onClick={() => setIsExpenseModalOpen(false)}>Cancelar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {isIncomeModalOpen && (
          <div className="modal-overlay">
              <div className="modal glass-section">
                  <h2>Adicionar Nova Receita</h2>
                  <form onSubmit={handleSubmitIncome}>
                      <input
                          type="number"
                          name="amount"
                          placeholder="Valor"
                          value={incomeData.amount}
                          onChange={handleIncomeChange}
                          required
                      />
                      <input
                          type="text"
                          name="category"
                          placeholder="Categoria (ex: Salário)"
                          value={incomeData.category}
                          onChange={handleIncomeChange}
                          required
                      />
                      {!isRecurring && (
                          <DatePicker
                              id="income-date"
                              value={incomeData.date}
                              onChange={(date) => setIncomeData(prev => ({ ...prev, date: date }))}
                              placeholderText="Data da Receita"
                              required={!isRecurring}
                          />
                      )}
                      <input
                          type="text"
                          name="description"
                          placeholder="Descrição (opcional)"
                          value={incomeData.description}
                          onChange={handleIncomeChange}
                      />

                      <div className="checkbox-container">
                          <input 
                              type="checkbox" 
                              id="isRecurringCheckbox"
                              checked={isRecurring}
                              onChange={(e) => setIsRecurring(e.target.checked)}
                          />
                          <label htmlFor="isRecurringCheckbox">Repetir esta receita mensalmente</label>
                      </div>

                      {isRecurring && (
                          <div className="recurring-fields">
                              <input 
                                  type="number" 
                                  name="repeatCount" 
                                  placeholder="Nº de Meses" 
                                  value={recurringData.repeatCount} 
                                  onChange={handleRecurringChange} 
                                  required 
                              />
                              <input 
                                  type="number" 
                                  name="dayOfMonth" 
                                  placeholder="Dia do Recebimento (ex: 5)" 
                                  value={recurringData.dayOfMonth} 
                                  onChange={handleRecurringChange} 
                                  required 
                              />
                          </div>
                      )}

                      <div className="modal-buttons">
                          <button type="submit">Adicionar Receita</button>
                          <button type="button" onClick={() => setIsIncomeModalOpen(false)}>Cancelar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showBirthdayModal && (
        <div className="modal-overlay">
            <div className="modal glass-section birthday-modal">
                <h2>Feliz Aniversário, {user?.fullName || user?.username}! 🎂</h2>
                <p>Desejamos a você um dia incrível e muito sucesso financeiro neste novo ciclo!</p>
                <div className="modal-buttons">
                    <button 
                        type="button" 
                        onClick={() => setShowBirthdayModal(false)}
                        className="btn-birthday-close"
                    >
                        Obrigado!
                    </button>
                </div>
            </div>
        </div>
      )}

      <ConfirmationPopup
        isOpen={isDeletePopupOpen}
        onClose={() => {
          setIsDeletePopupOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={confirmDelete}
        message="Tem certeza que deseja excluir esta transação?"
      />

      <ConfirmationPopup
        isOpen={isDeleteAllPopupOpen}
        onClose={() => setIsDeleteAllPopupOpen(false)}
        onConfirm={confirmDeleteAll}
        message="Tem certeza que deseja apagar TODAS as transações? Esta ação não pode ser desfeita."
      />
    </div>
  );
}

export default DashboardPage;