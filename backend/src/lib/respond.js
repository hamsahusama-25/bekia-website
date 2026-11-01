'use strict';

/** Every success response uses the same envelope: { success, requestId, data }. */
function ok(req, res, data, status = 200) {
  return res.status(status).json({ success: true, requestId: req.requestId, data });
}

module.exports = { ok };
