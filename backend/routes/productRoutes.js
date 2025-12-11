// backend/routes/productRoutes.js
import express from 'express';
const router = express.Router();
import { getProducts, createProduct, updateProduct } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // <-- Import RBAC

// Public Route (can be accessed by anyone, but pricing logic is inside the controller)
// Note: We run 'protect' middleware even here. If a token is present, it will attach req.role. If not, it just proceeds.
// To make it truly public, the frontend should send an unauthenticated request. 
// A simpler way for a MERN stack is to skip 'protect' and manually check req.headers.authorization in the controller if needed. 
// For now, let's keep it simple: ALL authenticated users see the adjusted price, unauthenticated users see the base price.

router.route('/')
    .get(protect, getProducts) // Auth users get role-specific prices
    .post(protect, authorize('admin'), createProduct); // Only Admin can create

// Routes for Product Details (Update/Delete)
router.route('/:id')
    .put(protect, authorize('admin'), updateProduct); // Only Admin can update
    // .delete(protect, authorize('admin'), deleteProduct) // (Optional: Add a delete endpoint)

export default router;