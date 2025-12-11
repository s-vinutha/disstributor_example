import express from 'express';
const router = express.Router();
import { 
    getWishlist, 
    addToWishlist, 
    removeFromWishlist 
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js'; // Requires user authentication

// /api/wishlist routes require authentication (protect middleware)
router.route('/')
    .get(protect, getWishlist)       // GET: Fetch all items in the user's wishlist
    .post(protect, addToWishlist);  // POST: Add a new item to the wishlist

router.route('/:id')
    .delete(protect, removeFromWishlist); // DELETE: Remove an item by its product ID

export default router;