const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const path = require('path');
const authRoutes = require('./routes/auth');
const saucesRoutes = require('./routes/sauces');

// Initialize dotenv.
dotenv.config();

// Set the CORS options.
const corsOptions = {
    origin: "http://localhost:4200"
};

const app = express();
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@xetaravel.ziytj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// Connect to MongoDB.
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB OK.'))
.catch(() => console.log('Erreur de connexion à MongoDB.'));

// Initialize the CORS with allowed domains.
app.use(cors(corsOptions));

// Use the JSON Middleware.
app.use(express.json());

// Serve static images.
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sauces', saucesRoutes);


module.exports = app;