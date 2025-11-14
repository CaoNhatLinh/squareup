import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { useParams ,useNavigate} from 'react-router-dom';
import { fetchTransactions, fetchTransactionStats } from '@/api/transactions';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/utils/dateUtils';
import { formatAmount } from '@/utils/amountUtils';
import {
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSearch,
} from 'react-icons/hi';

export default function Transactions() {
  const { restaurantId } = useParams();
  const { error: showError } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ hasMore: false, startingAfter: null, endingBefore: null });
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    customerEmail: '',
    transactionId: '',
  });
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { status: activeFilter !== 'all' ? activeFilter : undefined, limit: 10 };
      if (pagination.startingAfter) params.starting_after = pagination.startingAfter;
      if (pagination.endingBefore) params.ending_before = pagination.endingBefore;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.customerEmail) params.customerEmail = filters.customerEmail;
      if (filters.transactionId) params.transactionId = filters.transactionId;
      const data = await fetchTransactions(restaurantId, params);
      setTransactions(data.transactions || []);
      setPagination(prev => ({ ...prev, hasMore: data.has_more }));
    } catch (err) {
      console.error('Error loading transactions:', err);
      showError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, activeFilter, pagination.startingAfter, pagination.endingBefore, filters.dateFrom, filters.dateTo, filters.customerEmail, filters.transactionId, showError]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchTransactionStats(restaurantId);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [restaurantId]);
  const navigateToTransactionDetails = (transactionId) => {
    navigate(`/${restaurantId}/transactions/${transactionId}`);
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination({ hasMore: false, startingAfter: null, endingBefore: null });
  };

  const handleNextPage = () => {
    if (transactions.length > 0) {
      setPagination(prev => ({ ...prev, startingAfter: transactions[transactions.length - 1].id, endingBefore: null }));
    }
  };

  const handlePrevPage = () => {
    if (transactions.length > 0) {
      setPagination(prev => ({ ...prev, endingBefore: transactions[0].id, startingAfter: null }));
    }
  };
  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [loadTransactions, loadStats]);

  const getStatusBadge = (transaction) => {
    if (transaction.status === 'succeeded') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <HiOutlineCheckCircle className="w-4 h-4" />
          Succeeded
        </span>
      );
    }
    if (transaction.refunded) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
          <HiOutlineRefresh className="w-4 h-4" />
          Refunded
        </span>
      );
    }
    if (transaction.disputed) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <HiOutlineExclamationCircle className="w-4 h-4" />
          Disputed
        </span>
      );
    }
    if (transaction.status === 'requires_capture') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <HiOutlineClock className="w-4 h-4" />
          Uncaptured
        </span>
      );
    }
    if (transaction.status === 'canceled' || transaction.status === 'requires_payment_method') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <HiOutlineXCircle className="w-4 h-4" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
        {transaction.status}
      </span>
    );
  };

  const getPaymentMethodIcon = (brand) => {
    const brandLower = brand?.toLowerCase() || 'card';
    return (
      <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
        {brandLower === 'visa' ? 'VISA' : brandLower === 'mastercard' ? 'MC' : 'CARD'}
      </div>
    );
  };
  const filterButtons = [
    { id: 'all', label: 'All', count: stats?.total || 0 },
    { id: 'succeeded', label: 'Succeeded', count: stats?.succeeded || 0 },
    { id: 'refunded', label: 'Refunded', count: stats?.refunded || 0 },
    { id: 'disputed', label: 'Disputed', count: stats?.disputed || 0 },
    { id: 'failed', label: 'Failed', count: stats?.failed || 0 },
    { id: 'uncaptured', label: 'Uncaptured', count: stats?.uncaptured || 0 },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
            <HiOutlineCreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Transactions</h1>
            <p className="text-slate-600 mt-1">View and manage your Stripe payment transactions</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 inline-flex gap-1">
          {filterButtons.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === filter.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Email</label>
              <input
                type="email"
                value={filters.customerEmail}
                onChange={(e) => handleFilterChange('customerEmail', e.target.value)}
                placeholder="Search by email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transaction ID</label>
              <input
                type="text"
                value={filters.transactionId}
                onChange={(e) => handleFilterChange('transactionId', e.target.value)}
                placeholder="Search by ID"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineCreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">No transactions found</p>
            <p className="text-slate-500 text-sm mt-1">Transactions will appear here once customers make payments</p>
          </div>
        ) : (
          <React.Fragment>
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <tr
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigateToTransactionDetails(transaction.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </div>
                        <div className="text-xs text-slate-500">{transaction.currency}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.brand)}
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              •••• {transaction.last4 || '****'}
                            </div>
                            <div className="text-xs text-slate-500 capitalize">
                              {transaction.brand || 'Card'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 max-w-xs truncate">
                          {transaction.description || transaction.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {transaction.customer_email || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{formatDate(transaction.created)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(transaction)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-700">
              Showing {transactions.length} transactions
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.endingBefore}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasMore}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
