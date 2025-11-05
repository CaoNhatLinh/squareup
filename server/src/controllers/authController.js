const admin = require('firebase-admin');
const config = require('../config');
const db = admin.database();

async function sessionLogin(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRecord = await admin.auth().getUser(uid);
    const userRef = db.ref(`users/${uid}`);
    const userSnapshot = await userRef.get();
    
    const userData = {
      uid: uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
      photoURL: userRecord.photoURL || null,
      emailVerified: userRecord.emailVerified,
      lastLoginAt: Date.now(),
    };

    if (!userSnapshot.exists()) {
      userData.createdAt = Date.now();
      await userRef.set(userData);
    } else {
      await userRef.update(userData);
    }
    const expiresIn = 5 * 24 * 60 * 60 * 1000; 
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    res.cookie('session', sessionCookie, options);
    return res.json({ ok: true, user: userData });
  } catch (err) {
    console.error('sessionLogin error', err);
    return res.status(401).json({ error: 'Failed to create session' });
  }
}

async function sessionLogout(req, res) {
  try {
    const sessionCookie = req.cookies && req.cookies.session;
    if (sessionCookie) {
      try {
        const decoded = await admin.auth().verifySessionCookie(sessionCookie);
        await admin.auth().revokeRefreshTokens(decoded.uid);
      } catch (e) {
      }
    }
    res.clearCookie('session', { path: '/' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('sessionLogout error', err);
    return res.status(500).json({ error: 'Failed to logout' });
  }
}

async function verifySession(req, res) {
  try {
    const sessionCookie = req.cookies && req.cookies.session;
    if (!sessionCookie) return res.status(401).json({ error: 'No session' });
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    return res.json({ uid: decoded.uid, email: decoded.email });
  } catch (err) {
    console.error('verifySession error', err);
    return res.status(401).json({ error: 'Invalid session' });
  }
}

module.exports = { sessionLogin, sessionLogout, verifySession };
