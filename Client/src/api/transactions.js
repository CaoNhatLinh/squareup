import * as client from './apiClient'

/**
 * Fetch all transactions for a restaurant
 */
export async function fetchTransactions(restaurantId, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.starting_after) queryParams.append('starting_after', params.starting_after);
  if (params.ending_before) queryParams.append('ending_before', params.ending_before);
  if (params.status) queryParams.append('status', params.status);
  if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
  if (params.dateTo) queryParams.append('date_to', params.dateTo);
  if (params.customerEmail) queryParams.append('customer_email', params.customerEmail);
  if (params.transactionId) queryParams.append('transaction_id', params.transactionId);
  
  const queryString = queryParams.toString();
  const url = `/api/transactions/${restaurantId}${queryString ? `?${queryString}` : ''}`;
  
  const res = await client.get(url);
  return res.data;
}

/**
 * Fetch single transaction details
 */
export async function fetchTransactionDetails(restaurantId, paymentIntentId) {
  const res = await client.get(`/api/transactions/${restaurantId}/${paymentIntentId}`);
  return res.data;
}

/**
 * Fetch transaction statistics
 */
export async function fetchTransactionStats(restaurantId) {
  const res = await client.get(`/api/transactions/${restaurantId}/stats`);
  return res.data;
}

/**
 * Refund a transaction
 */
export async function refundTransaction(restaurantId, paymentIntentId, data = {}) {
  const res = await client.post(`/api/transactions/${restaurantId}/${paymentIntentId}/refund`, data);
  return res.data;
}
