import { useState, useEffect, useCallback } from 'react';
import { authAPI, expenseAPI, incomeAPI, reportAPI } from '../api';
import { User, Expense, Income, Summary, BalanceReport } from '../types';

export const useDashboardData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [incomeSummary, setIncomeSummary] = useState<Summary>({});
  const [balance, setBalance] = useState<BalanceReport | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await authAPI.getProfile();
      setUser(profile);

      const allExpenses = await expenseAPI.getAllExpenses();
      setExpenses(allExpenses);

      const allIncome = await incomeAPI.getAllIncome();
      setIncome(allIncome);

      const summaryData = await reportAPI.getSummary();
      setSummary(summaryData);

      const incomeSummaryData = await reportAPI.getIncomeSummary();
      setIncomeSummary(incomeSummaryData);

      const balanceData = await reportAPI.getBalance();
      setBalance(balanceData);

      const monthlyReport = await reportAPI.getMonthlyReport();
      const allMonthlyExpenses = Object.values(monthlyReport).flat() as Expense[];
      const total = allMonthlyExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
      setMonthlyTotal(total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    user,
    expenses,
    income,
    summary,
    incomeSummary,
    balance,
    monthlyTotal,
    loading,
    refreshData: fetchData
  };
};