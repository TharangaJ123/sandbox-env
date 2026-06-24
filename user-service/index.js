const express = require('express');

const app = express();
const PORT = 3001;

app.use(express.json());

// Sample mock data
const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// Health check
app.get('/', (req, res) => {
    res.send('User Service is up and running');
});

// Get all users
app.get('/users', (req, res) => {
    res.json(users);
});

// Get user by ID
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`User Service is running on http://localhost:${PORT}`);
});
