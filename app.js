import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'xxxx-xxxx';
const REFRESH_SECRET_KEY = 'refresh-xxxx-xxxx';

app.use(express.json());

// 'Database'
let users = [];
let refreshTokens = [];

// Register route
async function register(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 8);
    users.push({ username, password: hashedPassword, email });
    console.log('User registered Successfully.');
    return true;
}

// Login route
async function login(email, password) {
    const user = users.find(user => user.email == email);
    if (!user) {
        console.log('User not found.');
        return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('Invalid credentials');
        return null;
    }
    const accessToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ email }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

    refreshTokens.push(refreshToken); // Store refresh token
    console.log('Access Token:', accessToken, '\n');
    console.log('Refresh Token:', refreshToken, '\n');
    return { accessToken, refreshToken };
}

// Refresh token endpoint
app.post('/token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: 'Refresh token not found or invalid.' });
    }
    jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        const newAccessToken = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ accessToken: newAccessToken });
    });
});

// Register and Login
register('Sandeep', 'ex@gmail.com', 'exm123');
setTimeout(() => {
    login('ex@gmail.com', 'exm123');
}, 5000);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
