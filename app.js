// app.js 

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


const app = express();
const PORT = process.env.PORT ||3000;
const SECRET_KEY = 'xxxx-xxxx';

app.use(express.json());

// This will act as our 'database'
let users = [];

// Register route
async function register(username, email, password) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 8);
    // Save the user
    users.push({ username, password: hashedPassword, email });
    console.log('User registered Successfully.');
    return true;
}

// Login route
async function login(email, password) {
    // Find the user
    const user = users.find(user => user.email == email);
    if (!user) {
        console.log('User not found.')
        return null;
    }
    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('Invalid credentials');
        return null;
    }
    console.log('User Details', user, '\n')
    // Generate a JWT
    const token = jwt.sign(
        { email },
        SECRET_KEY,
        { expiresIn: '1h' });
    console.log('Token', token, '\n')
    return token;
}

// register a user 
register('Sandeep', 'ex@gmail.com', 'exm123')

setTimeout(() => {
    login('ex@gmail.com', 'exm123')
}, 5000); // after 5 second login 

app.listen(PORT, () => {
    console.log(`Server is running  ${PORT}`);
});
