
const jwt = require('jsonwebtoken');
const SECRET = 'mysecret';

module.exports = (req, res, next) => {
	let token = req.headers.authorization;
	if (!token) return res.status(401).send('No token');

	// Accept both raw token and `Bearer <token>` header values
	if (typeof token === 'string' && token.toLowerCase().startsWith('bearer ')) {
		token = token.slice(7).trim();
	}

	try {
		req.user = jwt.verify(token, SECRET);
		next();
	} catch (e) {
		return res.status(401).send('Invalid');
	}
};
