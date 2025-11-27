import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useDashboardData } from './hooks/useDashboardData';
import { Expense } from './types';
import { expenseAPI } from './api';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ModeToggle } from "@/components/mode-toggle";
import {  
  LogOut, 
  Plus, 
  Wallet, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Calendar,
  Trash2,
  Edit2,
  DollarSign,
  CreditCard,
  Activity,
  Download,
  Utensils,
  Car,
  Film,
  Zap,
  ShoppingBag,
  Heart,
  GraduationCap,
  Plane,
  Layers,
  ChevronDown,
  Check,
  Filter,
  History
} from 'lucide-react';

const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Education', 'Travel', 'Other'];

function Main() {
  const navigate = useNavigate();
  const { user, expenses, summary, loading, refreshData } = useDashboardData();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    time: '',
    categoryName: categories[0],
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [chartTab, setChartTab] = useState<'daily' | 'weekly' | 'monthly' | 'category'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i + 1).sort((a, b) => b - a);

  const getCategoryIcon = (categoryName: string, size: string = "w-5 h-5") => {
    switch (categoryName) {
      case 'Food': return <Utensils className={`${size} text-orange-400`} />;
      case 'Transport': return <Car className={`${size} text-blue-400`} />;
      case 'Entertainment': return <Film className={`${size} text-purple-400`} />;
      case 'Utilities': return <Zap className={`${size} text-yellow-400`} />;
      case 'Shopping': return <ShoppingBag className={`${size} text-pink-400`} />;
      case 'Health': return <Heart className={`${size} text-red-400`} />;
      case 'Education': return <GraduationCap className={`${size} text-indigo-400`} />;
      case 'Travel': return <Plane className={`${size} text-sky-400`} />;
      default: return <Layers className={`${size} text-slate-400`} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDownloadPDF = async () => {
    const chartsElement = document.getElementById('charts-section');
    const historyElement = document.getElementById('history-section');
    
    if (!chartsElement || !historyElement) return;

    // Store original tab
    const originalTab = chartTab;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Header Background
      pdf.setFillColor(16, 185, 129); // Emerald-500
      pdf.rect(0, 0, pageWidth, 20, 'F');
      
      // Header Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Personal Expense Manager', margin, 13);

      // Report Info
      pdf.setTextColor(30, 41, 59); // Slate-800
      pdf.setFontSize(14);
      pdf.text(`Monthly Report: ${new Date(selectedMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`, margin, 35);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139); // Slate-500
      pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, 42);

      let currentY = 55;

      // Define tabs to capture
      const tabsToCapture: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];

      for (const tab of tabsToCapture) {
        // Switch tab and wait for render
        setChartTab(tab);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for re-render and animation

        // Capture Charts
        const chartsCanvas = await html2canvas(chartsElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#0f172a' // slate-900
        });
        
        const chartsImgData = chartsCanvas.toDataURL('image/png');
        const chartsHeight = (chartsCanvas.height * contentWidth) / chartsCanvas.width;
        
        // Check if we need a new page
        if (currentY + chartsHeight + 20 > pageHeight - margin) {
            pdf.addPage();
            currentY = margin + 10;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(15, 23, 42); // Slate-900
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${tab.charAt(0).toUpperCase() + tab.slice(1)} Analytics`, margin, currentY - 5);
        
        pdf.addImage(chartsImgData, 'PNG', margin, currentY, contentWidth, chartsHeight);
        currentY += chartsHeight + 15;
      }

      // Capture History
      const historyCanvas = await html2canvas(historyElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a' // slate-900
      });

      const historyImgData = historyCanvas.toDataURL('image/png');
      const historyHeight = (historyCanvas.height * contentWidth) / historyCanvas.width;
      
      // Check if history fits on the same page
      if (currentY + historyHeight + 20 > pageHeight - margin) {
        pdf.addPage();
        currentY = margin + 10;
      }
        
      pdf.setFontSize(12);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction History', margin, currentY - 5);
      
      pdf.addImage(historyImgData, 'PNG', margin, currentY, contentWidth, historyHeight);
      
      // Footer with page numbers
      const pageCount = pdf.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184); // Slate-400
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
      
      pdf.save(`expense-report-${selectedMonth}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
        // Restore original tab
        setChartTab(originalTab);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    setFormData({
      description: '',
      amount: '',
      date: dateStr,
      time: timeStr,
      categoryName: categories[0],
    });
    setShowModal(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      time: expense.time ? expense.time.substring(0, 5) : '00:00',
      categoryName: expense.category.name,
    });
    setShowModal(true);
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.deleteExpense(id);
        refreshData();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setErrorMessage('Amount must be greater than 0');
      return;
    }
    setErrorMessage('');

    const expenseData = {
      description: formData.description,
      amount: amount,
      date: formData.date,
      time: formData.time,
      user: user,
      category: { name: formData.categoryName },
    };

    try {
      if (editingExpense) {
        await expenseAPI.updateExpense(editingExpense.id, expenseData);
      } else {
        await expenseAPI.createExpense(expenseData);
      }
      setShowModal(false);
      refreshData();
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrorMessage('Error saving expense. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (user) {
      // We only need to fetch all expenses now, as we calculate reports client-side
      // But we keep refreshData in useDashboardData which fetches everything.
      // The hook useDashboardData already fetches expenses on mount.
    }
  }, [user]);

  const dailyData = useMemo(() => {
    const filtered = expenses.filter(e => e.date.startsWith(selectedMonth));
    const hourlyData: { [key: string]: number } = {};
    
    // Initialize all hours with 0
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00';
      hourlyData[hour] = 0;
    }

    // Aggregate expenses by hour
    filtered.forEach(exp => {
      const hour = exp.time ? exp.time.substring(0, 2) + ':00' : '00:00';
      if (hourlyData[hour] !== undefined) {
        hourlyData[hour] += exp.amount;
      }
    });

    return Object.entries(hourlyData).map(([time, amount]) => ({
      date: time,
      amount: amount
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses, selectedMonth]);

  const weeklyData = useMemo(() => {
    const filtered = expenses.filter(e => e.date.startsWith(selectedMonth));
    const grouped: Record<string, number> = {};
    
    filtered.forEach(e => {
      const date = new Date(e.date);
      const day = date.getDate();
      // Calculate week number (1-5)
      const week = Math.ceil(day / 7);
      const key = `Week ${week}`;
      grouped[key] = (grouped[key] || 0) + e.amount;
    });

    // Ensure all weeks are present if needed, or just show weeks with data
    // Let's show weeks 1-4/5
    const result = [];
    for(let i=1; i<=5; i++) {
      const key = `Week ${i}`;
      if (grouped[key] !== undefined || i <= 4) { // Show at least 4 weeks
         result.push({ date: key, amount: grouped[key] || 0 });
      }
    }
    return result;
  }, [expenses, selectedMonth]);

  const monthlyData = useMemo(() => {
    const filtered = expenses.filter(e => e.date.startsWith(selectedMonth));
    const grouped: Record<string, number> = {};
    
    filtered.forEach(e => {
      grouped[e.date] = (grouped[e.date] || 0) + e.amount;
    });

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount
      }));
  }, [expenses, selectedMonth]);

  const pieData = useMemo(() => {
    const filtered = expenses.filter(e => e.date.startsWith(selectedMonth));
    const grouped: Record<string, number> = {};
    
    filtered.forEach(e => {
      grouped[e.category.name] = (grouped[e.category.name] || 0) + e.amount;
    });

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [expenses, selectedMonth]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const totalExpenses = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
  const selectedMonthTotal = expenses
    .filter(e => e.date.startsWith(selectedMonth))
    .reduce((sum, exp) => sum + exp.amount, 0);
  const categoryCount = Object.keys(summary).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-black flex flex-col overflow-y-auto transition-colors duration-300">
      <div id="dashboard-content" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-6 md:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            <ModeToggle />
            <button 
              onClick={() => navigate('/profile')}
              className="group relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-300 shadow-lg ring-2 ring-transparent hover:ring-emerald-400/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                {user?.profilePicture ? (
                  <img 
                    src={`data:image/jpeg;base64,${user.profilePicture}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}</span>
                )}
              </div>
            </button>
            <button 
              onClick={handleLogout} 
              className="group relative px-8 py-2.5 bg-white/50 dark:bg-slate-900/30 backdrop-blur-2xl hover:bg-red-500/10 text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 rounded-full font-bold text-sm transition-all duration-300 border border-slate-200 dark:border-white/10 hover:border-red-500/50 shadow-lg hover:shadow-red-500/20 active:scale-95 overflow-hidden flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex items-center gap-2">
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-24 h-24 text-green-500 dark:text-green-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Expenses</h3>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">${totalExpenses.toFixed(2)}</p>
              <div className="mt-4 flex items-center gap-2 text-green-500 dark:text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Lifetime spending</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="w-24 h-24 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Selected Month</h3>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">${selectedMonthTotal.toFixed(2)}</p>
              <div className="mt-4 flex items-center gap-2 text-blue-500 dark:text-blue-400 text-sm">
                <Activity className="w-4 h-4" />
                <span>{new Date(selectedMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PieChartIcon className="w-24 h-24 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Categories</h3>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{categoryCount}</p>
              <div className="mt-4 flex items-center gap-2 text-purple-500 dark:text-purple-400 text-sm">
                <CreditCard className="w-4 h-4" />
                <span>Active categories</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="mb-8 relative bg-white/50 dark:bg-slate-900/30 backdrop-blur-2xl p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl overflow-visible z-20 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Filters
            </h3>
            
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium mr-2">Period:</span>
              
              {/* Month Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                  className="min-w-[140px] px-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:ring-2 focus:ring-emerald-500/50 outline-none group"
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {months.find(m => m.value === selectedMonth.split('-')[1])?.label || 'Month'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMonthOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar z-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 p-1">
                      {months.map(month => (
                        <button
                          key={month.value}
                          onClick={() => {
                            const [y] = selectedMonth.split('-');
                            setSelectedMonth(`${y}-${month.value}`);
                            setIsMonthOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedMonth.split('-')[1] === month.value 
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {month.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                  className="min-w-[100px] px-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:ring-2 focus:ring-emerald-500/50 outline-none group"
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedMonth.split('-')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isYearOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar z-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 p-1">
                      {years.map(year => (
                        <button
                          key={year}
                          onClick={() => {
                            const [, m] = selectedMonth.split('-');
                            setSelectedMonth(`${year}-${m}`);
                            setIsYearOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            parseInt(selectedMonth.split('-')[0]) === year 
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Charts Section */}
          <div id="charts-section" className="lg:col-span-2 bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Analytics
              </h3>
              <div className="relative bg-slate-100 dark:bg-slate-900/30 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-1.5 rounded-xl sm:rounded-full overflow-x-auto max-w-full transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex items-center min-w-max">
                  <button 
                    onClick={handleDownloadPDF}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/10 transition-all flex-shrink-0"
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1"></div>
                  {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setChartTab(tab)}
                      className={`px-4 sm:px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                        chartTab === tab 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'category' ? (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                ) : (
                  <AreaChart data={
                    chartTab === 'daily' ? dailyData :
                    chartTab === 'weekly' ? weeklyData :
                    monthlyData
                  }>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '12px' }}
                      itemStyle={{ color: '#10b981' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions & Actions */}
          <div className="flex flex-col gap-6">
            {/* Quick Add */}
            <button 
              onClick={handleAddExpense}
              className="w-full relative py-4 bg-white/50 dark:bg-slate-900/30 backdrop-blur-2xl hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-3xl font-bold text-lg border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 shadow-xl shadow-emerald-500/5 dark:shadow-emerald-500/10 transition-all transform hover:scale-[1.02] overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                <Plus className="w-6 h-6" />
                Add New Expense
              </div>
            </button>

            {/* Recent List */}
            <div className="flex-1 bg-white/50 dark:bg-slate-900/30 backdrop-blur-2xl p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden flex flex-col relative transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                Recent
              </h3>
              <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1 max-h-[400px]">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30 hover:bg-slate-800/60 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                        {getCategoryIcon(expense.category.name)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{expense.description}</p>
                        <p className="text-slate-400 text-xs">
                          {new Date(expense.date).toLocaleDateString()}
                          {expense.time && <span className="ml-1">at {expense.time.substring(0, 5)}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">${expense.amount.toFixed(2)}</p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end mt-1">
                        <button 
                          onClick={() => handleEditExpense(expense)} 
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-all border border-blue-500/20 hover:border-blue-500/40"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)} 
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-500/20 hover:border-red-500/40"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    No transactions yet
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>



        {/* Transaction History Table */}
        <section id="history-section" className="bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-xl transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Transaction History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700/30">
                {expenses
                  .filter(expense => expense.date.startsWith(selectedMonth))
                  .map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{expense.description}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {expense.category.name}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {new Date(expense.date).toLocaleDateString()}
                      {expense.time && <span className="ml-2 text-slate-400 dark:text-slate-500 text-xs">{expense.time.substring(0, 5)}</span>}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">${expense.amount.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleEditExpense(expense)} 
                          className="group flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all border border-blue-500/20 hover:border-blue-500/40"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)} 
                          className="group flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-all border border-red-500/20 hover:border-red-500/40"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {expenses.filter(expense => expense.date.startsWith(selectedMonth)).length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No transactions found for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/90 dark:bg-slate-900/30 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl transform transition-all scale-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex justify-center items-center mb-6 md:mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">{editingExpense ? 'Edit Expense' : 'New Expense'}</h3>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Amount Input - Prominent */}
              <div className="relative">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Amount</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl font-medium group-focus-within:text-emerald-500 transition-colors">$</span>
                  <input 
                    type="number" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleInputChange} 
                    required 
                    step="0.01" 
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white text-3xl font-bold placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Category Dropdown - Custom */}
              <div className="relative">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Category</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none group"
                >
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.categoryName}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCategoryOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="p-1.5 space-y-1">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setFormData({...formData, categoryName: cat});
                            setIsCategoryOpen(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${formData.categoryName === cat ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'}`}
                        >
                          <span className="font-medium text-sm flex-1 text-left">{cat}</span>
                          {formData.categoryName === cat && <Check className="w-4 h-4 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Description</label>
                <input 
                  type="text" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="What was this for?"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Time</label>
                  <input 
                    type="time" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {errorMessage && <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20 flex items-center gap-2">⚠️ {errorMessage}</p>}
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium transition-colors" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;
