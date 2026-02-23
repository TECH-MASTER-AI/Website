import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    // Use a secure secret in production (process.env.JWT_SECRET)
    const secret = process.env.JWT_SECRET || 'dev_secret_do_not_use_in_prod';

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
}
