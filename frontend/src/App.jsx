import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Navbar } from './components/Navbar';
import { TransactionModal } from './components/TransactionModal';
import { AccountModal } from './components/AccountModal';
import { TransferModal } from './components/TransferModal';
import { BudgetModal } from './components/BudgetModal';
import { CategoryModal } from './components/CategoryModal';
import { DebtModal } from './components/DebtModal';
import { DebtPaymentModal } from './components/DebtPaymentModal';
import { FriendModal } from './components/FriendModal';

import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountsPage } from './pages/AccountsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ReportsPage } from './pages/ReportsPage';
import { DebtsPage } from './pages/DebtsPage';
import { FriendsPage } from './pages/FriendsPage';
import { LoginPage } from './pages/LoginPage';

import { api } from './services/api';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('thuchi_user');
    const token = localStorage.getItem('thuchi_token');
    if (saved && token) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const now = new Date();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [initialBudgetCat, setInitialBudgetCat] = useState(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [defaultCatType, setDefaultCatType] = useState('EXPENSE');

  // Debt modal states
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState(null);

  // Friend modal states
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState(null);

  // Load all foundational data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, accRes, catRes, friendRes] = await Promise.all([
        api.getDashboardSummary(currentMonth, currentYear),
        api.getAccounts(),
        api.getCategories(),
        api.getFriends()
      ]);

      setSummaryData(sumRes.data);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      setFriends(friendRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu app:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
      try {
        await api.logout();
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem('thuchi_token');
      localStorage.removeItem('thuchi_user');
      setCurrentUser(null);
    }
  };

  // Handlers for Transactions
  const handleOpenNewTx = () => {
    setEditingTx(null);
    setTxModalOpen(true);
  };

  const handleOpenEditTx = (tx) => {
    setEditingTx(tx);
    setTxModalOpen(true);
  };

  const handleSaveTransaction = async (txData) => {
    if (txData.id) {
      await api.updateTransaction(txData.id, txData);
    } else {
      await api.createTransaction(txData);
    }
    loadData();
  };

  // Handlers for Accounts
  const handleOpenNewAccount = () => {
    setEditingAccount(null);
    setAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc) => {
    setEditingAccount(acc);
    setAccountModalOpen(true);
  };

  const handleSaveAccount = async (accData) => {
    if (accData.id) {
      await api.updateAccount(accData.id, accData);
    } else {
      await api.createAccount(accData);
    }
    loadData();
  };

  const handleTransfer = async (transferData) => {
    await api.transferMoney(transferData);
    loadData();
  };

  // Handlers for Budgets
  const handleOpenBudgetModal = (budget = null) => {
    setInitialBudgetCat(budget);
    setBudgetModalOpen(true);
  };

  const handleSaveBudget = async (budgetData) => {
    await api.setBudget(budgetData);
    loadData();
  };

  // Handlers for Categories
  const handleOpenNewCategory = (type = 'EXPENSE') => {
    setEditingCategory(null);
    setDefaultCatType(type);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (catData) => {
    if (catData.id) {
      await api.updateCategory(catData.id, catData);
    } else {
      await api.createCategory(catData);
    }
    loadData();
  };

  // Handlers for Debts
  const handleOpenNewDebt = () => {
    setEditingDebt(null);
    setDebtModalOpen(true);
  };

  const handleOpenEditDebt = (debt) => {
    setEditingDebt(debt);
    setDebtModalOpen(true);
  };

  const handleSaveDebt = async (debtData) => {
    if (debtData.id) {
      await api.updateDebt(debtData.id, debtData);
    } else {
      await api.createDebt(debtData);
    }
    loadData();
  };

  const handleOpenPaymentModal = (debt) => {
    setSelectedDebtForPayment(debt);
    setPaymentModalOpen(true);
  };

  const handleSaveDebtPayment = async (debtId, paymentData) => {
    await api.addDebtPayment(debtId, paymentData);
    loadData();
  };

  // Handlers for Friends
  const handleOpenNewFriend = () => {
    setEditingFriend(null);
    setFriendModalOpen(true);
  };

  const handleOpenEditFriend = (friend) => {
    setEditingFriend(friend);
    setFriendModalOpen(true);
  };

  const handleSaveFriend = async (friendData) => {
    if (friendData.id) {
      await api.updateFriend(friendData.id, friendData);
    } else {
      await api.createFriend(friendData);
    }
    loadData();
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Tổng quan Tài chính';
      case 'transactions': return 'Sổ thu chi & Giao dịch';
      case 'debts': return 'Sổ Vay & Ghi Nợ';
      case 'friends': return 'Danh bạ Bạn bè & Đối tác';
      case 'accounts': return 'Tài khoản & Ví tiền';
      case 'budgets': return 'Hạn mức Ngân sách';
      case 'categories': return 'Quản lý Danh mục';
      case 'reports': return 'Báo cáo & Phân tích';
      default: return 'ThuChi 247';
    }
  };

  // Nếu chưa đăng nhập, hiển thị trang Đăng nhập
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTx={handleOpenNewTx}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={getPageTitle()}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onChangePeriod={(m, y) => {
            setCurrentMonth(m);
            setCurrentYear(y);
          }}
          onOpenNewTx={handleOpenNewTx}
          onRefresh={loadData}
          loading={loading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              data={summaryData}
              loading={loading}
              onOpenNewTx={handleOpenNewTx}
              onViewAllTx={() => setActiveTab('transactions')}
              onOpenAccountModal={handleOpenNewAccount}
              onOpenTransferModal={() => setTransferModalOpen(true)}
              onOpenEditTx={handleOpenEditTx}
              onViewDebts={() => setActiveTab('debts')}
              onViewFriends={() => setActiveTab('friends')}
              friendsCount={friends.length}
            />
          )}

          {activeTab === 'debts' && (
            <DebtsPage
              accounts={accounts}
              friends={friends}
              onRefreshSummary={loadData}
              onOpenNewDebt={handleOpenNewDebt}
              onOpenEditDebt={handleOpenEditDebt}
              onOpenPayment={handleOpenPaymentModal}
            />
          )}

          {activeTab === 'friends' && (
            <FriendsPage
              onRefreshSummary={loadData}
              onOpenNewFriend={handleOpenNewFriend}
              onOpenEditFriend={handleOpenEditFriend}
              onNavigateToTx={() => setActiveTab('transactions')}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              accounts={accounts}
              categories={categories}
              friends={friends}
              onOpenEditTx={handleOpenEditTx}
              onRefreshSummary={loadData}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsPage
              accounts={accounts}
              loading={loading}
              onRefresh={loadData}
              onOpenNewAccount={handleOpenNewAccount}
              onOpenEditAccount={handleOpenEditAccount}
              onOpenTransfer={() => setTransferModalOpen(true)}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsPage
              categories={categories}
              month={currentMonth}
              year={currentYear}
              onOpenBudgetModal={handleOpenBudgetModal}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesPage
              categories={categories}
              loading={loading}
              onRefresh={loadData}
              onOpenNewCategory={handleOpenNewCategory}
              onOpenEditCategory={handleOpenEditCategory}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              data={summaryData}
              loading={loading}
              month={currentMonth}
              year={currentYear}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTx={handleOpenNewTx}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        accounts={accounts}
        categories={categories}
        friends={friends}
      />

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onTransfer={handleTransfer}
        accounts={accounts}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        categories={categories}
        month={currentMonth}
        year={currentYear}
        initialCategory={initialBudgetCat}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        defaultType={defaultCatType}
      />

      <DebtModal
        isOpen={debtModalOpen}
        onClose={() => setDebtModalOpen(false)}
        onSave={handleSaveDebt}
        editingDebt={editingDebt}
        accounts={accounts}
        friends={friends}
      />

      <DebtPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSavePayment={handleSaveDebtPayment}
        debt={selectedDebtForPayment}
        accounts={accounts}
      />

      <FriendModal
        isOpen={friendModalOpen}
        onClose={() => setFriendModalOpen(false)}
        onSave={handleSaveFriend}
        editingFriend={editingFriend}
      />
    </div>
  );
}

