import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_do_not_use_in_prod';

// Helper to generate JWT
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin,
            full_name: user.full_name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// POST /api/auth/register
router.post(
    '/register',
    [
        body('username').trim().isLength({ min: 3 }).escape(),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('full_name').optional().trim().escape(),
        body('phone_number').optional().trim().escape(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, full_name, phone_number } = req.body;

        try {
            // Check if user exists
            const userCheck = await query('SELECT id FROM dsa_users WHERE email = $1 OR username = $2', [email, username]);
            if (userCheck.rows.length > 0) {
                return res.status(409).json({ error: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Insert user
            const result = await query(
                `INSERT INTO dsa_users (username, email, password_hash, full_name, phone_number, is_admin)
         VALUES ($1, $2, $3, $4, $5, FALSE)
         RETURNING id, username, email, full_name, phone_number, is_admin, rating, problems_solved`,
                [username, email, passwordHash, full_name || null, phone_number || null]
            );

            const user = result.rows[0];
            const token = generateToken(user);

            res.status(201).json({
                success: true,
                user,
                token,
            });
        } catch (err) {
            console.error('Register error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Find user
            const result = await query('SELECT * FROM dsa_users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];

            // Check password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = generateToken(user);

            // Return user without password
            const { password_hash, ...userProfile } = user;

            res.json({
                success: true,
                user: userProfile,
                token,
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, username, email, full_name, phone_number, is_admin, rating, problems_solved FROM dsa_users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.sendStatus(404);
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('Auth check error:', err);
        res.sendStatus(500);
    }
});

export default router;
