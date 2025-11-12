const admin = require('firebase-admin');

async function verifyAdmin(req, res, next) {
  try {
    const sessionCookie = req.cookies && req.cookies.session;

    let decodedClaims = null;

    if (sessionCookie) {
      try {
        decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      } catch (err) {
        decodedClaims = null;
      }
    }

    if (!decodedClaims) {
      const authHeader = req.headers && req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1];
        try {
          decodedClaims = await admin.auth().verifyIdToken(idToken, true);
        } catch (err) {
            
        }
      }
    }

    if (!decodedClaims) {
      return res.status(401).json({ error: 'No valid session or idToken provided' });
    }

    if (!decodedClaims.admin) {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        isAdmin: false 
      });
    }

    req.user = {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      admin: decodedClaims.admin,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = verifyAdmin;
