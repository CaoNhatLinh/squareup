const admin = require('firebase-admin');
const db = admin.database();

// Define available resources and permissions
const RESOURCES = [
  'items',
  'categories',
  'modifiers',
  'discounts',
  'orders',
  'transactions',
  'reviews',
  'business_settings',
  'staff',
];

const PERMISSIONS = ['create', 'read', 'update', 'delete'];

async function getRoles(req, res) {
  const { restaurantId } = req.params;
  try {
    const rolesRef = db.ref(`restaurants/${restaurantId}/roles`);
    const snapshot = await rolesRef.get();

    if (!snapshot.exists()) {
      return res.json({ roles: [] });
    }

    const roles = [];
    snapshot.forEach((child) => {
      roles.push({ id: child.key, ...child.val() });
    });

    return res.json({ roles });
  } catch (error) {
    console.error('getRoles error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getRole(req, res) {
  const { restaurantId, roleId } = req.params;

  try {
    const roleSnapshot = await db.ref(`restaurants/${restaurantId}/roles/${roleId}`).get();
    
    if (!roleSnapshot.exists()) {
      return res.status(404).json({ error: 'Role not found' });
    }

    return res.json({ role: { id: roleId, ...roleSnapshot.val() } });
  } catch (error) {
    console.error('getRole error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createRole(req, res) {
  const { restaurantId } = req.params;
  const { name, description, permissions } = req.body;

  if (!name || !permissions) {
    return res.status(400).json({ error: 'Name and permissions are required' });
  }
  if (!validatePermissions(permissions)) {
    return res.status(400).json({ error: 'Invalid permissions structure' });
  }

  try {
    const roleRef = db.ref(`restaurants/${restaurantId}/roles`).push();
    const roleData = {
      name,
      description: description || '',
      permissions,
      createdAt: Date.now(),
      createdBy: req.user.uid,
    };
    await roleRef.set(roleData);
    return res.status(201).json({
      message: 'Role created successfully',
      role: { id: roleRef.key, ...roleData },
    });
  } catch (error) {
    console.error('createRole error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateRole(req, res) {
  const { restaurantId, roleId } = req.params;
  const { name, description, permissions } = req.body;
  try {
    const roleSnapshot = await db.ref(`restaurants/${restaurantId}/roles/${roleId}`).get();
    if (!roleSnapshot.exists()) {
      return res.status(404).json({ error: 'Role not found' });
    }
    const updates = {
      updatedAt: Date.now(),
      updatedBy: req.user.uid,
    };

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (permissions) {
      if (!validatePermissions(permissions)) {
        return res.status(400).json({ error: 'Invalid permissions structure' });
      }
      updates.permissions = permissions;
    }
    await db.ref(`restaurants/${restaurantId}/roles/${roleId}`).update(updates);
    return res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('updateRole error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteRole(req, res) {
  const { restaurantId, roleId } = req.params;
  try {
    const roleSnapshot = await db.ref(`restaurants/${restaurantId}/roles/${roleId}`).get();
    
    if (!roleSnapshot.exists()) {
      return res.status(404).json({ error: 'Role not found' });
    }
    const staffSnapshot = await db.ref(`restaurants/${restaurantId}/staff`)
      .orderByChild('roleId')
      .equalTo(roleId)
      .get();

    if (staffSnapshot.exists()) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to staff members' 
      });
    }
    await db.ref(`restaurants/${restaurantId}/roles/${roleId}`).remove();
    return res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('deleteRole error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getPermissionsStructure(req, res) {
  return res.json({
    resources: RESOURCES,
    permissions: PERMISSIONS,
  });
}

function validatePermissions(permissions) {
  if (typeof permissions !== 'object' || permissions === null) {
    return false;
  }
  for (const [resource, perms] of Object.entries(permissions)) {
    if (!RESOURCES.includes(resource)) {
      return false;
    }
    if (typeof perms !== 'object' || perms === null) {
      return false;
    }
    for (const [perm, value] of Object.entries(perms)) {
      if (!PERMISSIONS.includes(perm) || typeof value !== 'boolean') {
        return false;
      }
    }
  }
  return true;
}

module.exports = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getPermissionsStructure,
  RESOURCES,
  PERMISSIONS,
};
