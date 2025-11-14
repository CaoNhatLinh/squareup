import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTransactionDetails, refundTransaction } from "@/api/transactions";
import { useToast } from "@/hooks/useToast";
import {
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineArrowLeft,
  HiOutlineReceiptRefund,
  HiCurrencyDollar,
  HiOutlineUser,
  HiCalendar,
  HiXMark,
  HiArrowPath,
} from "react-icons/hi2";

export default function TransactionDetails() {
  const { restaurantId, paymentIntentId } = useParams();
  const { error: showError, success: showSuccess } = useToast();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("requested_by_customer");

  useEffect(() => {
    loadTransactionDetails();
  }, [restaurantId, paymentIntentId]);

  const loadTransactionDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactionDetails(restaurantId, paymentIntentId);
      setTransaction(data);
      const refundableAmount = data.amount / 100 - data.refunded_amount;
      setRefundAmount(refundableAmount.toFixed(2));
    } catch (err) {
      console.error("Error loading transaction:", err);
      showError("Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (parseFloat(refundAmount) <= 0) {
      showError("Refund amount must be greater than zero.");
      return;
    }
    const refundableAmount =
      transaction.amount / 100 - transaction.refunded_amount;
    if (parseFloat(refundAmount) > refundableAmount) {
      showError(
        `Refund amount exceeds available amount (${formatAmount(
          refundableAmount,
          transaction.currency
        )})`
      );
      return;
    }

    try {
      setRefunding(true);
      const refundData = {
        reason: refundReason,
      };
      // Chỉ gửi amount nếu là partial refund hoặc nếu số tiền nhập khác tổng số tiền còn lại
      if (parseFloat(refundAmount).toFixed(2) !== refundableAmount.toFixed(2)) {
        refundData.amount = parseFloat(refundAmount);
      }
      await refundTransaction(restaurantId, paymentIntentId, refundData);
      showSuccess("Transaction refunded successfully");
      setShowRefundDialog(false);
      loadTransactionDetails();
    } catch (err) {
      console.error("Error refunding transaction:", err);
      showError(err.response?.data?.error || "Failed to refund transaction");
    } finally {
      setRefunding(false);
    }
  };

  const getStatusBadge = () => {
    if (!transaction) return null;

    if (transaction.status === "disputed") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
          <HiOutlineExclamationCircle className="w-4 h-4" />
          Disputed
        </span>
      );
    }
    if (transaction.status === "refunded") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300">
          <HiOutlineReceiptRefund className="w-4 h-4" />
          Refunded
        </span>
      );
    }
    if (transaction.status === "succeeded") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
          <HiOutlineCheckCircle className="w-4 h-4" />
          Succeeded
        </span>
      );
    }
    if (transaction.status === "requires_capture") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
          <HiOutlineClock className="w-4 h-4" />
          Uncaptured
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
        <HiOutlineXCircle className="w-4 h-4" />
        Failed / Pending
      </span>
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount, currency) => {
    // ✅ Xử lý giá trị NaN (ví dụ: phí hoặc net amount khi chưa tính toán)
    if (isNaN(amount) || amount === null) return "—";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Tính số tiền có thể hoàn lại (dựa trên amount / 100)
  const refundableAmount = transaction
    ? transaction.amount / 100 - transaction.refunded_amount
    : 0;
  const isPartialRefund = transaction && transaction.refunded_amount > 0;

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-red-600"></div>
        </div>
        <div className="text-center text-sm text-slate-500 mt-4">
          Loading transaction details...
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <HiOutlineCreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Transaction not found</p>
        </div>
      </div>
    );
  }

  // Lấy chi tiết order
  const order = transaction.order || {};

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link
          to={`/${restaurantId}/transactions`}
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 font-medium"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to Transactions
        </Link>

        <div className="flex items-start justify-between bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
              {formatAmount(transaction.amount, transaction.currency)}
            </h1>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <HiCalendar className="w-4 h-4" />
                {formatDate(transaction.created)}
              </span>
            </div>
          </div>

          {transaction.can_refund && refundableAmount > 0 && (
            <button
              onClick={() => setShowRefundDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md flex-shrink-0"
            >
              <HiOutlineReceiptRefund className="w-5 h-5" />
              Issue Refund
            </button>
          )}
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT 1: THÔNG TIN ĐƠN HÀNG VÀ TÀI CHÍNH */}
        <div className="lg:col-span-2 space-y-6">
          {transaction.order && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HiArrowPath className="w-5 h-5 text-red-600" />
                Order Details ({order.orderId || "N/A"})
              </h2>

              {/* Customer Info */}
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                  <HiOutlineUser className="w-4 h-4 text-slate-500" />
                  {transaction.customer_name || "Guest User"}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {transaction.customer_email}
                </p>
                {order.customerInfo?.address && (
                  <p className="text-sm text-slate-600 mt-1">
                    {order.customerInfo.address.city},{" "}
                    {order.customerInfo.address.state}
                  </p>
                )}
              </div>

              {/* Item List */}
              <div className="space-y-4 mb-6">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start border-b border-slate-100 pb-2"
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-slate-900">
                        {item.name}
                      </p>
                      {item.selectedOptions &&
                        item.selectedOptions.length > 0 && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Options:{" "}
                            {item.selectedOptions
                              .map((opt) => opt.name)
                              .join(", ")}
                          </p>
                        )}
                      {item.specialInstruction && (
                        <p className="text-xs text-red-500 mt-0.5 italic">
                          Note: {item.specialInstruction}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-slate-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatAmount(
                          item.totalPrice / 100,
                          transaction.currency
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount/Subtotal Breakdown */}
              <div className="border-y border-slate-200 py-3 mb-6 space-y-1.5">
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>
                    {formatAmount(order.subtotal, transaction.currency)}
                  </span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>Tax</span>
                    <span>{formatAmount(order.tax, transaction.currency)}</span>
                  </div>
                )}
                {order.discount?.totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm font-medium text-green-600">
                    <span>
                      Discount ({order.discount.appliedDiscounts.length}{" "}
                      applied)
                    </span>
                    <span>
                      -
                      {formatAmount(
                        order.discount.totalDiscount,
                        transaction.currency
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Final Total */}
              <div className="pt-2">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-extrabold text-slate-900">
                    Total Charged
                  </p>
                  <p className="text-lg font-extrabold text-red-600">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </p>
                </div>
              </div>

              {/* Cancellation Status */}
              {order.status === "cancelled" && (
                <div className="mt-6 pt-4 border-t border-red-300 bg-red-50 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-1">
                    <HiOutlineXCircle className="w-4 h-4" /> Order Cancelled
                  </h3>
                  {order.cancelReason && (
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Reason:</span>{" "}
                      {order.cancelReason}
                    </p>
                  )}
                  {order.refunded && (
                    <p className="text-sm text-green-700 mt-2 font-medium">
                      ✓ Payment has been refunded (ID: {order.refundId})
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HiCurrencyDollar className="w-5 h-5 text-red-600" />
              Financial Summary
            </h2>
            <dl className="space-y-4">
              <div className="flex justify-between py-1">
                <dt className="text-sm font-medium text-slate-700">
                  Payment Status
                </dt>
                <dd className="mt-1 text-sm text-slate-900 font-semibold">
                  {getStatusBadge()}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-sm font-medium text-slate-500">
                  Transaction ID
                </dt>
                <dd className="mt-1 text-sm text-slate-900 font-mono break-all">
                  {transaction.id}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-sm font-medium text-slate-500">
                  Gross Amount
                </dt>
                <dd className="mt-1 text-sm text-slate-900 font-semibold">
                  {formatAmount(transaction.amount, transaction.currency)}
                </dd>
              </div>
              {transaction.refunded && (
                <div className="flex justify-between py-1 border-t border-slate-100">
                  <dt className="text-sm font-medium text-slate-500">
                    Refunded Amount
                  </dt>
                  <dd className="mt-1 text-sm text-red-600 font-semibold">
                    -
                    {formatAmount(
                      transaction.refunded_amount,
                      transaction.currency
                    )}
                  </dd>
                </div>
              )}
              {transaction.fee !== null && (
                <div className="flex justify-between py-1">
                  <dt className="text-sm font-medium text-slate-500">
                    Processing Fee
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatAmount(transaction.fee, transaction.currency)}
                  </dd>
                </div>
              )}
              {transaction.net !== null && (
                <div className="flex justify-between py-1 border-t border-slate-300 mt-2">
                  <dt className="text-base font-bold text-slate-900">
                    Net Deposit
                  </dt>
                  <dd className="mt-1 text-base font-extrabold text-green-600">
                    {formatAmount(transaction.net, transaction.currency)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* CỘT 2: THÔNG TIN KHÁCH HÀNG & LỊCH SỬ */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-red-600" />
              Customer & Payment Source
            </h2>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-slate-500">Name</dt>
                <dd className="text-sm text-slate-900">
                  {transaction.customer_name || "Guest User"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="text-sm text-slate-900 break-all">
                  {transaction.customer_email || "N/A"}
                </dd>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <dt className="text-sm font-medium text-slate-500">
                  Payment Type
                </dt>
                <dd className="text-sm text-slate-900 capitalize">
                  {transaction.payment_method || "N/A"}
                </dd>
              </div>
              {transaction.brand && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-500">
                    Card Brand
                  </dt>
                  <dd className="text-sm text-slate-900 capitalize">
                    {transaction.brand}
                  </dd>
                </div>
              )}
              {transaction.last4 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-slate-500">
                    Card Digits
                  </dt>
                  <dd className="text-sm text-slate-900">
                    •••• {transaction.last4}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Activity / Events */}
          {transaction.events && transaction.events.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {transaction.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 border-b border-slate-100 last:border-0 pb-3"
                  >
                    <div className="w-2 h-2 mt-2.5 rounded-full bg-red-500 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 capitalize">
                        {event.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(event.created)}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1 break-all">
                        {event.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refunds History */}
          {transaction.refunds && transaction.refunds.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <HiOutlineReceiptRefund className="w-5 h-5 text-orange-600" />{" "}
                Refund History
              </h2>
              <div className="space-y-4">
                {transaction.refunds.map((refund) => (
                  <div
                    key={refund.id}
                    className="p-4 border border-orange-200 bg-orange-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-slate-600">
                        {refund.id}
                      </span>
                      <span className="text-sm font-medium text-green-600 capitalize">
                        {refund.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Amount:</span>
                        <span className="ml-2 font-semibold text-red-600">
                          {formatAmount(refund.amount, transaction.currency)}
                        </span>
                      </div>
                      {refund.reason && (
                        <div>
                          <span className="text-slate-500">Reason:</span>
                          <span className="ml-2 text-slate-900 capitalize">
                            {refund.reason.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-slate-500">Date:</span>
                        <span className="ml-2 text-slate-900">
                          {formatDate(refund.created)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REFUND DIALOG (MODAL) */}
      {showRefundDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 border border-red-200">
            <h3 className="text-2xl font-extrabold text-red-700 mb-6 flex items-center gap-2">
              <HiOutlineReceiptRefund className="w-6 h-6" /> Confirm Refund
            </h3>

            {isPartialRefund && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg text-sm">
                ⚠️ This transaction has already been partially refunded.
              </div>
            )}

            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Refund Amount ({transaction.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={refundableAmount.toFixed(2)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-lg"
                />
                <p className="mt-1 text-xs text-slate-600 font-medium">
                  Max available to refund:{" "}
                  <span className="font-bold text-red-600">
                    {formatAmount(refundableAmount, transaction.currency)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reason for Refund
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="requested_by_customer">
                    Requested by Customer
                  </option>
                  <option value="duplicate">Duplicate Payment</option>
                  <option value="fraudulent">Fraudulent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowRefundDialog(false)}
                disabled={refunding}
                className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors disabled:opacity-50"
              >
                <HiXMark className="w-5 h-5 inline-block mr-1" /> Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={
                  refunding || !refundAmount || parseFloat(refundAmount) <= 0
                }
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
              >
                {refunding ? (
                  <span className="flex items-center justify-center">
                    <HiArrowPath className="w-5 h-5 animate-spin mr-1" />{" "}
                    Processing...
                  </span>
                ) : (
                  `Refund ${formatAmount(
                    parseFloat(refundAmount) || 0,
                    transaction.currency
                  )}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
