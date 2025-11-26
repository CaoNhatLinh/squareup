const { admin, db } = require('../config/firebaseAdmin');

exports.getTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const tablesSnapshot = await db
      .ref(`restaurants/${restaurantId}/tables`)
      .orderByChild('isActive')
      .equalTo(true)
      .get();

    const tables = [];
    const tablesData = tablesSnapshot.val();
    
    if (tablesData) {
      Object.keys(tablesData).forEach((tableId) => {
        tables.push({
          id: tableId,
          ...tablesData[tableId],
        });
      });
    }

    tables.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json(tables);
  } catch (error) {
    console.error('Error getting tables:', error);
    res.status(500).json({ error: 'Failed to get tables' });
  }
};


exports.getTableById = async (req, res) => {
  try {
    const { restaurantId, tableId } = req.params;

    const tableSnapshot = await db
      .ref(`restaurants/${restaurantId}/tables/${tableId}`)
      .get();

    if (!tableSnapshot.exists()) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const tableData = tableSnapshot.val();

    res.json({
      id: tableId,
      ...tableData,
    });
  } catch (error) {
    console.error('Error getting table:', error);
    res.status(500).json({ error: 'Failed to get table' });
  }
};

/**
 * Create a new table
 */
exports.createTable = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, items = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Table name is required' });
    }

    const tableData = {
      name: name.trim(),
      items: items,
      status: items.length > 0 ? 'occupied' : 'available',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      customerInfo: req.body.customerInfo || null,
      notes: req.body.notes || null,
    };

    const newTableRef = db.ref(`restaurants/${restaurantId}/tables`).push();
    await newTableRef.set(tableData);

    res.status(201).json({
      id: newTableRef.key,
      ...tableData,
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ error: 'Failed to create table' });
  }
};

/**
 * Update a table
 */
exports.updateTable = async (req, res) => {
  try {
    const { restaurantId, tableId } = req.params;
    const { name, items } = req.body;

    const tableRef = db.ref(`restaurants/${restaurantId}/tables/${tableId}`);
    const tableSnapshot = await tableRef.get();

    if (!tableSnapshot.exists()) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Optimistic locking: client can pass expectedUpdatedAt to prevent race updates
    const expectedUpdatedAt = req.body.expectedUpdatedAt;

    const updateData = {
      updatedAt: Date.now(),
    };

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Table name cannot be empty' });
      }
      updateData.name = name.trim();
    }

    if (items !== undefined) {
      updateData.items = items;
      updateData.status = items.length > 0 ? 'occupied' : 'available';
    }
    if (req.body.customerInfo !== undefined) {
      updateData.customerInfo = req.body.customerInfo || null;
    }
    if (req.body.notes !== undefined) {
      updateData.notes = req.body.notes || null;
    }

    // If client provided expectedUpdatedAt, validate it against current record
    if (expectedUpdatedAt !== undefined && tableSnapshot.exists()) {
      const current = tableSnapshot.val();
      if ((current.updatedAt || 0) !== expectedUpdatedAt) {
        return res.status(409).json({ error: 'Conflict: the table was modified by another user', currentUpdatedAt: current.updatedAt });
      }
    }

    await tableRef.update(updateData);

    const updatedSnapshot = await tableRef.once('value');
    res.json({
      id: tableId,
      ...updatedSnapshot.val(),
    });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ error: 'Failed to update table' });
  }
};

/**
 * Delete a table (soft delete)
 */
exports.deleteTable = async (req, res) => {
  try {
    const { restaurantId, tableId } = req.params;

    const tableRef = db.ref(`restaurants/${restaurantId}/tables/${tableId}`);
    const tableSnapshot = await tableRef.once('value');

    if (!tableSnapshot.exists()) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const tableData = tableSnapshot.val();

    // Check if table has items
    if (tableData.items && tableData.items.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete table with items. Please complete checkout first.' 
      });
    }

    await tableRef.update({
      isActive: false,
      updatedAt: Date.now(),
    });

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Failed to delete table' });
  }
};

/**
 * Merge tables
 */
exports.mergeTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { sourceTableIds, targetTableId, newTableName, expectedUpdatedAt = {} } = req.body;

    if (!sourceTableIds || !Array.isArray(sourceTableIds) || sourceTableIds.length === 0) {
      return res.status(400).json({ error: 'Source table IDs are required' });
    }

    if (!targetTableId) {
      return res.status(400).json({ error: 'Target table ID is required' });
    }

    const allTableIds = [...sourceTableIds, targetTableId];
    const tablesData = [];

    // Get all tables and validate expectedUpdatedAt if present
    for (const tableId of allTableIds) {
      const tableSnapshot = await db
        .ref(`restaurants/${restaurantId}/tables/${tableId}`)
        .get();
      
      if (!tableSnapshot.exists()) {
        return res.status(404).json({ error: `Table ${tableId} not found` });
      }
      
      const record = tableSnapshot.val();
      if (expectedUpdatedAt && expectedUpdatedAt[tableId] !== undefined && (record.updatedAt || 0) !== expectedUpdatedAt[tableId]) {
        return res.status(409).json({ error: `Conflict: table ${tableId} was modified by another user`, currentUpdatedAt: record.updatedAt });
      }
      tablesData.push({ 
        id: tableId, 
        data: record,
      });
    }

    // Merge all items
    const mergedItems = [];
    tablesData.forEach((table) => {
      if (table.data.items && table.data.items.length > 0) {
        mergedItems.push(...table.data.items);
      }
    });

    // Update target table
    const targetTable = tablesData.find(t => t.id === targetTableId);
    const targetRef = db.ref(`restaurants/${restaurantId}/tables/${targetTableId}`);
    
    await targetRef.update({
      items: mergedItems,
      status: mergedItems.length > 0 ? 'occupied' : 'available',
      name: newTableName || targetTable.data.name,
      updatedAt: Date.now(),
    });

    // Soft delete source tables
    const updates = {};
    sourceTableIds.forEach((tableId) => {
      updates[`restaurants/${restaurantId}/tables/${tableId}/isActive`] = false;
      updates[`restaurants/${restaurantId}/tables/${tableId}/updatedAt`] = Date.now();
    });
    
    await db.ref().update(updates);

    // Get updated target table
    const updatedSnapshot = await targetRef.get();
    res.json({
      id: targetTableId,
      ...updatedSnapshot.val(),
    });
  } catch (error) {
    console.error('Error merging tables:', error);
    res.status(500).json({ error: 'Failed to merge tables' });
  }
};

/**
 * Clear table after checkout
 */
exports.clearTable = async (req, res) => {
  try {
    const { restaurantId, tableId } = req.params;

    const tableRef = db.ref(`restaurants/${restaurantId}/tables/${tableId}`);
    const tableSnapshot = await tableRef.get();

    if (!tableSnapshot.exists()) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const expectedUpdatedAt = req.body.expectedUpdatedAt;

    // conflict check
    if (expectedUpdatedAt !== undefined && tableSnapshot.exists()) {
      const current = tableSnapshot.val();
      if ((current.updatedAt || 0) !== expectedUpdatedAt) {
        return res.status(409).json({ error: 'Conflict: the table was modified by another user', currentUpdatedAt: current.updatedAt });
      }
    }

    await tableRef.update({
      items: [],
      status: 'available',
      updatedAt: Date.now(),
      customerInfo: null,
      notes: null,
    });

    const updatedSnapshot = await tableRef.once('value');
    res.json({
      id: tableId,
      ...updatedSnapshot.val(),
    });
  } catch (error) {
    console.error('Error clearing table:', error);
    res.status(500).json({ error: 'Failed to clear table' });
  }
};
