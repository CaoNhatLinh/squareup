const { getDecodedUserFromRequest } = require('../utils/auth');

async function attachUser(req, res, next) {
  try {
    const decoded = await getDecodedUserFromRequest(req);
    req.user = decoded || null;
  } catch (err) {
    // Do not fail on missing or invalid token; we'll let more specific middleware handle auth requirements
    req.user = null;
  }
  return next();
}

module.exports = attachUser;

