import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
const REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

app.use(express.json());

// MySQL Connection
const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'auth_db'
});

// Register route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [
            username,
            email,
            hashedPassword
        ]);
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'User not found.' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

        const accessToken = jwt.sign({ id: user.id, email }, SECRET_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id, email }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

        // Store refresh token in DB
        await db.execute('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [user.id, refreshToken]);

        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed.' });
    }
});

// Refresh Token Endpoint
app.post('/token', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided.' });

    try {
        const [tokens] = await db.execute('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
        if (tokens.length === 0) return res.status(403).json({ message: 'Invalid refresh token.' });

        jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
            if (err) return res.sendStatus(403);
            const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ accessToken });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not refresh token.' });
    }
});

// Logout Route (Delete Refresh Token)
app.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    try {
        await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Logout failed.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
