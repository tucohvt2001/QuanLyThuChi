const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Lỗi xử lý yêu cầu');
  }

  return data;
}

export const api = {
  // Dashboard
  getDashboardSummary: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return request(`/dashboard/summary?${params.toString()}`);
  },

  // Accounts
  getAccounts: () => request('/accounts'),
  createAccount: (data) => request('/accounts', { method: 'POST', body: data }),
  updateAccount: (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: data }),
  deleteAccount: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),
  transferMoney: (data) => request('/accounts/transfer', { method: 'POST', body: data }),

  // Categories
  getCategories: (type) => request(`/categories${type ? `?type=${type}` : ''}`),
  createCategory: (data) => request('/categories', { method: 'POST', body: data }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== '') {
        query.append(k, params[k]);
      }
    });
    return request(`/transactions?${query.toString()}`);
  },
  createTransaction: (data) => request('/transactions', { method: 'POST', body: data }),
  updateTransaction: (id, data) => request(`/transactions/${id}`, { method: 'PUT', body: data }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  // Budgets
  getBudgets: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return request(`/budgets?${params.toString()}`);
  },
  setBudget: (data) => request('/budgets', { method: 'POST', body: data }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),

  // Debts & Loans (Sổ Nợ)
  getDebts: (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== '') {
        query.append(k, params[k]);
      }
    });
    return request(`/debts?${query.toString()}`);
  },
  getDebtById: (id) => request(`/debts/${id}`),
  createDebt: (data) => request('/debts', { method: 'POST', body: data }),
  updateDebt: (id, data) => request(`/debts/${id}`, { method: 'PUT', body: data }),
  deleteDebt: (id) => request(`/debts/${id}`, { method: 'DELETE' }),
  addDebtPayment: (id, data) => request(`/debts/${id}/payments`, { method: 'POST', body: data }),

  // Friends (Quản lý Bạn bè)
  getFriends: (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== '') {
        query.append(k, params[k]);
      }
    });
    return request(`/friends?${query.toString()}`);
  },
  getFriendById: (id) => request(`/friends/${id}`),
  createFriend: (data) => request('/friends', { method: 'POST', body: data }),
  updateFriend: (id, data) => request(`/friends/${id}`, { method: 'PUT', body: data }),
  deleteFriend: (id) => request(`/friends/${id}`, { method: 'DELETE' }),
};

