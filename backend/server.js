// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // <--- NEW: Import CORS middleware
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'; 
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js'; 

import wishlistRoutes from './routes/wishlistRoutes.js'; 

dotenv.config();
connectDB(); 

const app = express();

app.use(cors()); 
app.use(express.json()); 

// Define a simple root route for testing API status
app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes); 

// --- Error Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// --- Start the Server ---
app.listen(PORT, () => 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);