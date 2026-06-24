const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3002;

app.use(express.json());

// Sample mock data
let orders = [
    { id: 1, userId: 1, product: 'Laptop', amount: 1500 },
    { id: 2, userId: 2, product: 'Phone', amount: 800 }
];

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Health check
app.get('/', (req, res) => {
    res.send('Order Service is up and running');
});

// Get all orders
app.get('/orders', (req, res) => {
    res.json(orders);
});

// Create an order
app.post('/orders', async (req, res) => {
    const { userId, product, amount } = req.body;

    if (!userId || !product || !amount) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Fetch user details from User Service
        const userResponse = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
        const user = userResponse.data;

        const newOrder = {
            id: orders.length + 1,
            userId: user.id,
            product,
            amount,
            userName: user.name,
            userEmail: user.email
        };

        orders.push(newOrder);

        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder
        });

    } catch (error) {
        // If the user service returns a 404, it means the user was not found
        if (error.response && error.response.status === 404) {
             return res.status(404).json({ message: 'Order creation failed: User not found in User Service' });
        }
        
        console.error('Error communicating with User Service:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Order Service is running on http://localhost:${PORT}`);
});
