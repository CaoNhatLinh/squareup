const admin = require('firebase-admin');
const db = admin.database();
async function getCustomers(req, res) {
  try {
    const { restaurantId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 25;
    const page = parseInt(req.query.page, 10) || 1;
    const q = (req.query.q || '').toLowerCase().trim();
    const minOrders = req.query.minOrders ? parseInt(req.query.minOrders, 10) : null;
    const minSpent = req.query.minSpent ? parseFloat(req.query.minSpent) : null;
    const dateFrom = req.query.dateFrom ? parseInt(req.query.dateFrom, 10) : null;
    const dateTo = req.query.dateTo ? parseInt(req.query.dateTo, 10) : null;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    const ordersSnapshot = await db.ref(`restaurants/${restaurantId}/orders`).get();
    const ordersData = ordersSnapshot.val();
    if (!ordersData) {
      return res.status(200).json({ success: true, data: [] });
    }

    const customersMap = {};
    Object.values(ordersData).forEach(order => {
      if (dateFrom && (order.createdAt || 0) < dateFrom) return;
      if (dateTo && (order.createdAt || 0) > dateTo) return;
      const email = (order.customerEmail || 'guest').toLowerCase();
      const name = order.customerName || null;
      const amount = order.total || order.amount || 0;
      if (!customersMap[email]) {
        customersMap[email] = {
          email,
          name,
          order_count: 0,
          total_spent: 0,
          last_order_date: 0,
        };
      }
      customersMap[email].order_count += 1;
      customersMap[email].total_spent += Number(amount || 0);
      customersMap[email].last_order_date = Math.max(customersMap[email].last_order_date || 0, order.createdAt || 0);
    });

    let customers = Object.values(customersMap).sort((a,b) => b.last_order_date - a.last_order_date);
    // handle server-side sorting
    const sortBy = req.query.sortBy || 'last_order_date';
    const sortDir = (req.query.sortDir || 'desc').toLowerCase();
    const dir = sortDir === 'asc' ? 1 : -1;
    const sortableFields = ['email', 'name', 'order_count', 'total_spent', 'last_order_date'];
    if (sortBy && sortableFields.includes(sortBy)) {
      customers = customers.sort((a, b) => {
        let va = a[sortBy];
        let vb = b[sortBy];
        if (va === undefined || va === null) va = '';
        if (vb === undefined || vb === null) vb = '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }
    // Apply search query
    if (q) {
      customers = customers.filter(c => (c.email || '').includes(q) || (c.name || '').toLowerCase().includes(q));
    }
    // Apply min orders filter
    if (minOrders !== null && !isNaN(minOrders)) {
      customers = customers.filter(c => (c.order_count || 0) >= minOrders);
    }
    // Apply min spent filter (currency units)
    if (minSpent !== null && !isNaN(minSpent)) {
      customers = customers.filter(c => (c.total_spent || 0) >= minSpent);
    }

    const total = customers.length;
    const startIndex = Math.max((page - 1) * limit, 0);
    const endIndex = startIndex + limit;
    const paged = customers.slice(startIndex, endIndex);
    return res.status(200).json({ success: true, data: paged, meta: { total, limit, page } });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getCustomerOrders(req, res) {
  try {
      const { restaurantId } = req.params;
      const email = (req.query && req.query.email) || (req.params && req.params.customerEmail);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const sortBy = req.query.sortBy || 'date';
    const sortDir = (req.query.sortDir || 'desc').toLowerCase();
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });
    if (!email) return res.status(400).json({ error: 'email is required' });

    const ordersSnapshot = await db.ref(`restaurants/${restaurantId}/orders`).get();
    const ordersData = ordersSnapshot.val() || {};
    const normalizedEmail = (email || '').toLowerCase();
    let customerOrders = Object.values(ordersData)
      .filter(o => ((o.customerEmail || 'guest') || '').toLowerCase() === normalizedEmail)
      .map(o => ({
        id: o.id || o.orderId,
        date: o.createdAt || o.created || 0,
        name: o.customerName || '',
        total: o.total || o.amount || 0,
        currency: o.currency || 'USD',
        item_count: (o.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0),
      }))
    ;

    const dir = sortDir === 'asc' ? 1 : -1;
    const sortableFields = ['date', 'total', 'item_count'];
    if (sortBy && sortableFields.includes(sortBy)) {
      customerOrders = customerOrders.sort((a, b) => {
        let va = a[sortBy];
        let vb = b[sortBy];
        if (va === undefined || va === null) va = '';
        if (vb === undefined || vb === null) vb = '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    } else {
      customerOrders = customerOrders.sort((a,b) => b.date - a.date);
    }

    const totalOrders = customerOrders.length;

    const startIndex = Math.max((page - 1) * limit, 0);
    const endIndex = startIndex + limit;
    const pagedOrders = customerOrders.slice(startIndex, endIndex);

    return res.status(200).json({ success: true, data: pagedOrders, meta: { total: totalOrders, limit, page } });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getGuestOrders(req, res) {
  try {
    const { restaurantId } = req.params;
    const { guestUuid } = req.params;
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });
    if (!guestUuid) return res.status(400).json({ error: 'guestUuid is required' });

    const ordersSnapshot = await db.ref(`restaurants/${restaurantId}/orders`).get();
    const ordersData = ordersSnapshot.val() || {};

    const customerOrders = Object.values(ordersData)
      .filter(o => o.guestUuid === guestUuid)
      .map(o => ({
        ...o,
        id: o.id || o.orderId,
        restaurantId,
        date: o.createdAt || o.created || 0,
      }))
      .sort((a,b) => (b.date || 0) - (a.date || 0));

    return res.status(200).json({ success: true, data: customerOrders });
  } catch (error) {
    console.error('Error fetching guest orders:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function exportCustomers(req, res) {
  try {
    const { restaurantId } = req.params;
    const q = (req.query.q || '').toLowerCase().trim();
    const dateFrom = req.query.dateFrom ? parseInt(req.query.dateFrom, 10) : null;
    const dateTo = req.query.dateTo ? parseInt(req.query.dateTo, 10) : null;
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });

    const ordersSnapshot = await db.ref(`restaurants/${restaurantId}/orders`).get();
    const ordersData = ordersSnapshot.val() || {};

    const customersMap = {};
    Object.values(ordersData).forEach(order => {
      if (dateFrom && (order.createdAt || 0) < dateFrom) return;
      if (dateTo && (order.createdAt || 0) > dateTo) return;
      const email = (order.customerEmail || 'guest').toLowerCase();
      const name = order.customerName || null;
      const amount = order.total || order.amount || 0;
      if (!customersMap[email]) {
        customersMap[email] = { email, name, order_count: 0, total_spent: 0, last_order_date: 0 };
      }
      customersMap[email].order_count += 1;
      customersMap[email].total_spent += Number(amount || 0);
      customersMap[email].last_order_date = Math.max(customersMap[email].last_order_date || 0, order.createdAt || 0);
    });

    let customers = Object.values(customersMap);
    if (q) customers = customers.filter(c => (c.email || '').includes(q) || (c.name || '').toLowerCase().includes(q));
    const csvRows = [];
    csvRows.push(['Email', 'Name', 'Order Count', 'Total Spent', 'Last Order'].join(','));
    customers.forEach(c => {
      const row = [
        `"${c.email}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        c.order_count,
        c.total_spent,
        c.last_order_date || '',
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="customers_${restaurantId}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getCustomers, getCustomerOrders, getGuestOrders, exportCustomers };