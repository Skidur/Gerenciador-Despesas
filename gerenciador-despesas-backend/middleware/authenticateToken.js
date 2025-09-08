const jwt = require('jsonwebtoken');
const JWT_SECRET = 'bWibVZJfovdoZoH87JhcicaC7T8M82nfCrPKqzU4vPgqBQPcLYaBPPz9GD0cNWg6';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;