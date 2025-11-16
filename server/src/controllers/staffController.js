const admin = require('firebase-admin');
const crypto = require('crypto');
const db = admin.database();
const { sendInvitationEmail } = require('../utils/emailService');
async function getStaffMembers(req, res) {
  const { restaurantId } = req.params;
  try {
    const staffRef = db.ref(`restaurants/${restaurantId}/staff`);
    const snapshot = await staffRef.get();
    if (!snapshot.exists()) {
      return res.json({ staff: [] });
    }
    const staffList = [];
    snapshot.forEach((child) => {
      staffList.push({ id: child.key, ...child.val() });
    });
    return res.json({ staff: staffList });
  } catch (error) {
    console.error('getStaffMembers error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
async function inviteStaff(req, res) {
  const { restaurantId } = req.params;
  const { email, roleId } = req.body;
  if (!restaurantId) {
    console.error('inviteStaff: missing restaurantId in params');
    return res.status(400).json({ error: 'restaurantId is required in the URL' });
  }
  if (!email || !roleId) {
    return res.status(400).json({ error: 'Email and roleId are required' });
  }

  try {
    const roleSnapshot = await db.ref(`restaurants/${restaurantId}/roles/${roleId}`).get();
    if (!roleSnapshot.exists()) {
      return res.status(404).json({ error: 'Role not found' });
    }
    const staffSnapshot = await db.ref(`restaurants/${restaurantId}/staff`)
      .orderByChild('email')
      .equalTo(email)
      .get();
    if (staffSnapshot.exists()) {
      return res.status(400).json({ error: 'This user is already a staff member' });
    }
    const invitationsSnapshot = await db.ref(`invitations`)
      .orderByChild('email')
      .equalTo(email)
      .get();
    
    let existingInvitation = null;
    invitationsSnapshot.forEach((child) => {
      const inv = child.val();
      if (inv.restaurantId === restaurantId && inv.status === 'pending') {
        existingInvitation = { id: child.key, ...inv };
      }
    });
    if (existingInvitation) {
      return res.status(400).json({ error: 'There is already a pending invitation for this email' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const restaurantSnapshot = await db.ref(`restaurants/${restaurantId}`).get();
    const restaurantData = restaurantSnapshot.val();
    const roleData = roleSnapshot.val();
    const invitationRef = db.ref('invitations').push();
    const invitationData = {
      email,
      restaurantId,
      restaurantName: restaurantData?.name || 'Restaurant',
      roleId,
      roleName: roleData?.name || 'Staff',
      token,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt,
      invitedBy: req.user.uid,
    };

    await invitationRef.set(invitationData);
    const invitationLink = `${process.env.CLIENT_URL}/accept-invitation?token=${token}`;
    const emailResult = await sendInvitationEmail(
      email, 
      restaurantData?.name || 'Restaurant', 
      invitationLink,
      roleData?.name || 'Staff'
    );
    return res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: { id: invitationRef.key, ...invitationData },
      emailSent: emailResult.success,
      token,
    });
  } catch (error) {
    console.error('inviteStaff error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
async function getInvitation(req, res) {
  const { token } = req.params;
  try {
    const snapshot = await db.ref('invitations')
      .orderByChild('token')
      .equalTo(token)
      .get();

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    let invitation = null;
    snapshot.forEach((child) => {
      invitation = { id: child.key, ...child.val() };
    });

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'This invitation has already been used' });
    }

    if (invitation.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'This invitation has expired' });
    }
    const roleSnapshot = await db.ref(`restaurants/${invitation.restaurantId}/roles/${invitation.roleId}`).get();
    const role = roleSnapshot.exists() ? roleSnapshot.val() : null;

    return res.json({
      invitation: {
        ...invitation,
        role,
      },
    });
  } catch (error) {
    console.error('getInvitation error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function acceptInvitation(req, res) {
  const { token, password, displayName } = req.body;
  if (!token || !password || !displayName) {
    return res.status(400).json({ error: 'Token, password, and displayName are required' });
  }

  try {
    const snapshot = await db.ref('invitations')
      .orderByChild('token')
      .equalTo(token)
      .get();

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    let invitationId = null;
    let invitation = null;
    snapshot.forEach((child) => {
      invitationId = child.key;
      invitation = child.val();
    });

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'This invitation has already been used' });
    }

    if (invitation.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'This invitation has expired' });
    }
    let userRecord = null;
    try {
      userRecord = await admin.auth().getUserByEmail(invitation.email);
      return res.status(400).json({ error: 'An account with this email already exists' });
    } catch (error) {
      console.error('User does not exist, proceeding to create account.');
    }
    userRecord = await admin.auth().createUser({
      email: invitation.email,
      password,
      displayName,
      emailVerified: true, 
    });
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'staff',
      restaurantId: invitation.restaurantId,
    });
    await db.ref(`users/${userRecord.uid}`).set({
      email: invitation.email,
      displayName,
      role: 'staff',
      restaurantId: invitation.restaurantId,
      createdAt: Date.now(),
    });
    await db.ref(`users/${userRecord.uid}/restaurants/${invitation.restaurantId}`).set({
      name: invitation.restaurantName || 'Restaurant',
      role: 'staff',
      createdAt: Date.now(),
      active: true,
    });
    await db.ref(`restaurants/${invitation.restaurantId}/staff/${userRecord.uid}`).set({
      email: invitation.email,
      displayName,
      roleId: invitation.roleId,
      joinedAt: Date.now(),
    });
    await db.ref(`invitations/${invitationId}`).update({
      status: 'accepted',
      acceptedAt: Date.now(),
      userId: userRecord.uid,
    });
    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName,
      },
    });
  } catch (error) {
    console.error('acceptInvitation error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function removeStaff(req, res) {
  const { restaurantId, staffId } = req.params;
  try {
    const staffSnapshot = await db.ref(`restaurants/${restaurantId}/staff/${staffId}`).get();
    if (!staffSnapshot.exists()) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    await db.ref(`restaurants/${restaurantId}/staff/${staffId}`).remove();
    return res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('removeStaff error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateStaffRole(req, res) {
  const { restaurantId, staffId } = req.params;
  const { roleId } = req.body;
  if (!roleId) {
    return res.status(400).json({ error: 'RoleId is required' });
  }
  try {
    const roleSnapshot = await db.ref(`restaurants/${restaurantId}/roles/${roleId}`).get();
    if (!roleSnapshot.exists()) {
      return res.status(404).json({ error: 'Role not found' });
    }
    const staffSnapshot = await db.ref(`restaurants/${restaurantId}/staff/${staffId}`).get();
    if (!staffSnapshot.exists()) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    await db.ref(`restaurants/${restaurantId}/staff/${staffId}`).update({
      roleId,
      updatedAt: Date.now(),
    });

    return res.json({ message: 'Staff role updated successfully' });
  } catch (error) {
    console.error('updateStaffRole error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}


async function resendInvitation(req, res) {
  const { invitationId } = req.params;
  try {
    const snapshot = await db.ref(`invitations/${invitationId}`).get();
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    const invitation = snapshot.val();
    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot resend accepted or expired invitations' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    await db.ref(`invitations/${invitationId}`).update({
      token,
      expiresAt,
      updatedAt: Date.now(),
    });
    const invitationLink = `${process.env.CLIENT_URL}/accept-invitation?token=${token}`;
    const emailResult = await sendInvitationEmail(
      invitation.email, 
      invitation.restaurantName, 
      invitationLink,
      invitation.roleName
    );

    return res.json({
      message: 'Invitation resent successfully',
      emailSent: emailResult.success,
      token,
    });
  } catch (error) {
    console.error('resendInvitation error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
module.exports = {
  getStaffMembers,
  inviteStaff,
  getInvitation,
  acceptInvitation,
  removeStaff,
  updateStaffRole,
  resendInvitation,
};
