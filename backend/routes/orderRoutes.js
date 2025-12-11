// backend/routes/orderRoutes.js
import express from 'express';
const router = express.Router();
import { addOrderItems, getOrderById, updateOrderStatus, getOrders, getMyOrders } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Admin route to get ALL orders must come BEFORE the general routes
router.route('/').get(protect, authorize('admin'), getOrders).post(protect, addOrderItems); 
// POST is accessible by all authenticated users (Admin, Retailer, Individual Buyer)

// Route for any authenticated user to see their own orders
router.route('/myorders').get(protect, getMyOrders); 

// Route for specific order operations
router.route('/:id')
    .get(protect, getOrderById); // Accessible by order owner or Admin (checked in controller)

// Admin-specific route to update order status
router.route('/:id/status').put(protect, authorize('admin'), updateOrderStatus); 

export default router;