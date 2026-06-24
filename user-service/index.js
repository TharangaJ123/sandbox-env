const express = require('express');
const client = require('prom-client');

// Initialize metrics collection
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

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

// Expose metrics for Prometheus
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    res.send(await client.register.metrics());
});

app.listen(PORT, () => {
    console.log(`User Service is running on http://localhost:${PORT}`);
});
