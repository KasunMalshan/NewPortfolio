const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses JSON requests

// Define the Contact Schema and Model
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// MongoDB Connection
// Using the URI from .env, or a local default if not fully configured yet
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB!'))
    .catch((err) => {
        console.error('❌ MongoDB connection failed. Please check your .env file or local MongoDB installation.');
        console.error('Error details:', err.message);
    });

// API Route to handle contact form submissions
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const newMessage = new Contact({ name, email, message });
        await newMessage.save();

        console.log(`New message received from: ${name} (${email})`);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ success: false, message: 'Server error. Could not send message.' });
    }
});

// API Route to view all contact messages (for you to read them)
app.get('/api/contact', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        // Check if the provided password matches the secret password
        if (auth !== (process.env.ADMIN_PASSWORD || 'kasun123')) {
            return res.status(401).json({ success: false, message: 'Unauthorized login' });
        }
        const messages = await Contact.find().sort({ date: -1 }); // Newest first
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
