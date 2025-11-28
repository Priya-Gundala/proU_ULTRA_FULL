// backend/src/middleware/admin.js
// DEV: bypass admin-only restriction so any authenticated user can create/update/delete during development
module.exports = (req, res, next) => next();
