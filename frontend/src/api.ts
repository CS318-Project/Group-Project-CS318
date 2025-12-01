import axios from 'axios';

// Use relative base so Vite dev server can proxy `/api` to the backend.
// During production this should be the real backend URL.
const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Ensure headers object exists and set Authorization
    if (!config.headers) {
      // axios typings allow headers as any
      (config as any).headers = {};
    }
    (config as any).headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: handle 401/403 responses globally (remove token so UI can react)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url || '';
    // Don't redirect for login/signup failures, let the component handle the error
    if (url.includes('signin') || url.includes('signup') || url.includes('auth')) {
      return Promise.reject(err);
    }

    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Authentication API
export const authAPI = {
  signup: async (email: string, password: string, firstname: string, lastname: string) => {
    const response = await api.post('/auth/signup', { email, password, firstname, lastname });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  signin: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  updateProfile: async (firstname: string, lastname: string, email: string) => {
    const response = await api.put('/auth/profile', { firstname, lastname, email });
    return response.data;
  },
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/auth/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Expense API
export const expenseAPI = {
  getAllExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },
  getExpenseById: async (id: number) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  createExpense: async (expense: any) => {
    const response = await api.post('/expenses', expense);
    return response.data;
  },
  updateExpense: async (id: number, expense: any) => {
    const response = await api.put(`/expenses/${id}`, expense);
    return response.data;
  },
  deleteExpense: async (id: number) => {
    await api.delete(`/expenses/${id}`);
  },
};

// Income API
export const incomeAPI = {
  getAllIncome: async () => {
    const response = await api.get('/income');
    return response.data;
  },
  getIncomeById: async (id: number) => {
    const response = await api.get(`/income/${id}`);
    return response.data;
  },
  createIncome: async (income: any) => {
    const response = await api.post('/income', income);
    return response.data;
  },
  updateIncome: async (id: number, income: any) => {
    const response = await api.put(`/income/${id}`, income);
    return response.data;
  },
  deleteIncome: async (id: number) => {
    await api.delete(`/income/${id}`);
  },
};

// Report API
export const reportAPI = {
  getDailyReport: async () => {
    const response = await api.get('/reports/daily');
    return response.data;
  },
  getWeeklyReport: async () => {
    const response = await api.get('/reports/weekly');
    return response.data;
  },
  getMonthlyReport: async () => {
    const response = await api.get('/reports/monthly');
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/reports/summary');
    return response.data;
  },
  getIncomeSummary: async () => {
    const response = await api.get('/reports/income-summary');
    return response.data;
  },
  getBalance: async () => {
    const response = await api.get('/reports/balance');
    return response.data;
  },
};

export default api;