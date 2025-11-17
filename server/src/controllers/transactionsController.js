const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");
function classifyPaymentIntent(pi, statusFilter) {
  const charge = pi.latest_charge || (pi.charges?.data && pi.charges.data[0]);
  const isSucceeded = pi.status === "succeeded";
  const isRefunded = charge.amount_refunded > 0;
  const isDisputed =
    charge && charge.dispute !== null && charge.dispute !== undefined;
  let classifiedStatus;
  if (isDisputed) {
    classifiedStatus = "disputed";
  } else if (isRefunded) {
    classifiedStatus = "refunded";
  } else if (isSucceeded) {
    classifiedStatus = "succeeded";
  } else if (pi.status === "requires_capture") {
    classifiedStatus = "uncaptured";
  } else if (
    pi.status === "requires_payment_method" ||
    pi.status === "canceled" ||
    pi.status === "payment_failed"
  ) {
    classifiedStatus = "failed";
  } else {
    classifiedStatus = "pending";
  }
  if (!statusFilter) return classifiedStatus;
  return classifiedStatus === statusFilter;
}

async function getTransactions(req, res) {
  try {
    const { restaurantId } = req.params;
    const { limit = 100, starting_after, ending_before, status, date_from, date_to, customer_email, transaction_id } = req.query;

    const queryParams = {
      limit: parseInt(limit),
      expand: ["data.latest_charge", "data.customer", "data.charges"],
    };
    if (starting_after) queryParams.starting_after = starting_after;
    if (ending_before) queryParams.ending_before = ending_before;
    const paymentIntents = await stripe.paymentIntents.list(queryParams);
    const restaurantTransactions = paymentIntents.data.filter((pi) => {
      return pi.metadata?.restaurantId === restaurantId;
    });

    let filteredTransactions = restaurantTransactions;
    if (status) {
      filteredTransactions = filteredTransactions.filter((pi) =>
        classifyPaymentIntent(pi, status)
      );
    }
    if (date_from) {
      const fromDate = new Date(date_from).getTime() / 1000;
      filteredTransactions = filteredTransactions.filter((pi) => pi.created >= fromDate);
    }
    if (date_to) {
      const toDate = new Date(date_to).getTime() / 1000;
      filteredTransactions = filteredTransactions.filter((pi) => pi.created <= toDate);
    }
    if (customer_email) {
      filteredTransactions = filteredTransactions.filter((pi) => {
        const charge = pi.latest_charge || (pi.charges?.data && pi.charges.data[0]);
        const email = charge?.billing_details?.email || pi.receipt_email || (typeof pi.customer === 'object' ? pi.customer?.email : null) || pi.metadata?.customerEmail;
        return email && email.toLowerCase().includes(customer_email.toLowerCase());
      });
    }
    if (transaction_id) {
      filteredTransactions = filteredTransactions.filter((pi) => pi.id.includes(transaction_id));
    }

    const formattedTransactions = filteredTransactions.map((pi) => {
      const charge =
        pi.latest_charge || (pi.charges?.data && pi.charges.data[0]);
      const isDisputed = classifyPaymentIntent(pi, "disputed");
        const isRefunded = charge.amount_refunded > 0;
      const customerEmail = 
        charge?.billing_details?.email ||
        pi.receipt_email ||
        (typeof pi.customer === 'object' ? pi.customer?.email : null) ||
        pi.metadata?.customerEmail ||
        null;
      return {
        id: pi.id,
        amount: pi.amount / 100,
        currency: pi.currency.toUpperCase(),
        status:classifyPaymentIntent(pi, null),
        created: pi.created,
        customer_email: customerEmail,
        customer_name: charge?.billing_details?.name || pi.metadata?.customerName || null,
        description: pi.description || null,
        payment_method: charge?.payment_method_details?.type || null,
        last4: charge?.payment_method_details?.card?.last4 || null,
        brand: charge?.payment_method_details?.card?.brand || null,
        refunded:isRefunded,
        refunded_amount:charge.amount_refunded / 100,
        disputed: isDisputed,
        metadata: pi.metadata,
      };
    });
    const total = formattedTransactions.length;
    return res.status(200).json({ success: true, data: formattedTransactions, meta: { total, limit: parseInt(limit, 10) || 100, page: 1 }, has_more: paymentIntents.has_more });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
}

async function getTransactionDetails(req, res) {
  try {
    const { restaurantId, paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: [
          "customer",
          "latest_charge.refunds",
          "latest_charge.balance_transaction",
        ],
      }
    );
    if (paymentIntent.metadata?.restaurantId !== restaurantId) {
      return res
        .status(403)
        .json({ error: "Transaction does not belong to this restaurant" });
    }

    const charge =
      paymentIntent.latest_charge || paymentIntent.charges?.data[0];
    const balanceTransaction = charge?.balance_transaction;
    const isDisputed = classifyPaymentIntent(paymentIntent, "disputed");
    const customerEmail = 
      charge?.billing_details?.email ||
      paymentIntent.receipt_email ||
      (typeof paymentIntent.customer === 'object' ? paymentIntent.customer?.email : null) ||
      paymentIntent.metadata?.customerEmail ||
      null;
    
    const customerName =
      charge?.billing_details?.name ||
      (typeof paymentIntent.customer === 'object' ? paymentIntent.customer?.name : null) ||
      paymentIntent.metadata?.customerName ||
      null;
    const charges = paymentIntent.charges?.data.map(ch => ({
      id: ch.id,
      amount: ch.amount / 100,
      created: ch.created,
      status: ch.status,
      paid: ch.paid,
      refunded: ch.refunded,
      refund_amount: ch.amount_refunded / 100,
      receipt_url: ch.receipt_url,
      metadata: ch.metadata,
    })) || [];
    const refunds = [];
    if (paymentIntent.charges?.data) {
      for (const ch of paymentIntent.charges.data) {
        if (ch.refunds?.data) {
          refunds.push(...ch.refunds.data.map(r => ({
            id: r.id,
            amount: r.amount / 100,
            created: r.created,
            status: r.status,
            reason: r.reason,
            charge_id: r.charge,
            metadata: r.metadata,
          })));
        }
      }
    }
    
    const paymentEventTypes = [
      'payment_intent.created',
      'payment_intent.succeeded',
      'payment_intent.canceled',
      'payment_intent.payment_failed',
      'payment_intent.amount_capturable_updated',
      'charge.succeeded',
      'charge.failed',
      'charge.refunded',
      'charge.dispute.created',
      'charge.dispute.updated',
    ];
    
    const events = await stripe.events.list({
      limit: 50,
    });
    
    const relatedEvents = events.data
      .filter(e => {
        const objId = e.data?.object?.id;
        const piId = e.data?.object?.payment_intent;
        const isRelated = objId === paymentIntentId || piId === paymentIntentId;
        const isPaymentEvent = paymentEventTypes.includes(e.type);
        return isRelated && isPaymentEvent;
      })
      .map(e => ({
        id: e.id,
        type: e.type,
        created: e.created,
        description: e.type.replace(/\./g, ' ').replace(/_/g, ' '),
      }));
    const orderId = paymentIntent.metadata?.orderId || paymentIntent.metadata?.pendingOrderId;
    let orderDetails = null;
    if (orderId && restaurantId) {
      try {
        const orderSnapshot = await admin.database()
          .ref(`restaurants/${restaurantId}/orders/${orderId}`)
          .get();
        orderDetails = orderSnapshot.val();
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
    }
    const details = {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: classifyPaymentIntent(paymentIntent, null),
      disputed: isDisputed,
      created: paymentIntent.created,
      customer_email: customerEmail,
      customer_name: customerName,
      description: paymentIntent.description || null,
      payment_method: charge?.payment_method_details?.type || null,
      last4: charge?.payment_method_details?.card?.last4 || null,
      brand: charge?.payment_method_details?.card?.brand || null,
      refunded: paymentIntent.amount_refunded > 0,
      refunded_amount: paymentIntent.amount_refunded / 100,
      can_refund: paymentIntent.status === 'succeeded' && paymentIntent.amount_refunded === 0,
      payment_intent_metadata: paymentIntent.metadata,
      charge_metadata: charge?.metadata || {},
      receipt_url: charge?.receipt_url || null,
      fee: balanceTransaction ? balanceTransaction.fee / 100 : null,
      net: balanceTransaction ? balanceTransaction.net / 100 : null,
      charge_id: charge?.id || null,
      charges: charges,
      refunds: refunds,
      events: relatedEvents,
      order: orderDetails,
    };

    return res.status(200).json({ success: true, data: details });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch transaction details" });
  }
}
async function getTransactionStats(req, res) {
  try {
    const { restaurantId } = req.params;
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      expand: ["data.latest_charge",'data.customer'],
    }); 
    const restaurantTransactions = paymentIntents.data.filter(
      (pi) => pi.metadata?.restaurantId === restaurantId
    );
    const stats = {
      total: restaurantTransactions.length,
      succeeded: restaurantTransactions.filter((pi) =>
        classifyPaymentIntent(pi, "succeeded")
      ).length,
      refunded: restaurantTransactions.filter((pi) =>
        classifyPaymentIntent(pi, "refunded")
      ).length,
      disputed: restaurantTransactions.filter((pi) =>
        classifyPaymentIntent(pi, "disputed")
      ).length,
      failed: restaurantTransactions.filter((pi) =>
        classifyPaymentIntent(pi, "failed")
      ).length,
      uncaptured: restaurantTransactions.filter((pi) =>
        classifyPaymentIntent(pi, "uncaptured")
      ).length,
    };
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return res.status(500).json({ error: "Failed to fetch transaction stats" });
  }
}

async function refundTransaction(req, res) {
  try {
    const { restaurantId, paymentIntentId } = req.params;
    const { amount, reason } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.metadata?.restaurantId !== restaurantId) {
      return res.status(403).json({ error: "Transaction does not belong to this restaurant" });
    }
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: "Can only refund succeeded payments" });
    }
    const charge = paymentIntent.latest_charge || paymentIntent.charges?.data[0];
    if (!charge || typeof charge !== 'string') {
      return res.status(400).json({ error: "No charge found for this payment" });
    }
    const refundParams = {
      charge: charge,
      reason: reason || 'requested_by_customer',
    };
    if (amount) {
      const refundAmount = Math.round(parseFloat(amount) * 100);
      if (refundAmount > paymentIntent.amount - paymentIntent.amount_refunded) {
        return res.status(400).json({ error: "Refund amount exceeds available amount" });
      }
      refundParams.amount = refundAmount;
    }
    const refund = await stripe.refunds.create(refundParams);
    return res.status(200).json({ success: true, data: { refund: { id: refund.id, amount: refund.amount / 100, currency: refund.currency.toUpperCase(), status: refund.status, reason: refund.reason } } });
  } catch (error) {
    console.error('Error refunding transaction:', error);
    return res.status(500).json({ error: error.message || 'Failed to refund transaction' });
  }
}
module.exports = {
  getTransactions,
  getTransactionDetails,
  getTransactionStats,
  refundTransaction,
};
