import asyncHandler from 'express-async-handler';
import UserWishlistItem from '../models/wishlistItemModel.js';
import Product from '../models/productModel.js';

// @desc    Fetch all items in the user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    // Find all wishlist items belonging to the current user,
    // and populate the full details of the associated Product.
    const wishlistItems = await UserWishlistItem.find({ user: req.user._id })
        .populate('product', 'sku name category brand image_url base_price retailer_discount'); 
        
    res.json(wishlistItems);
});

// @desc    Add a product to the user's wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const { productId, desiredQuantity } = req.body;
    
    // Check if the product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
        res.status(404);
        throw new Error('Product not found.');
    }

    try {
        const item = await UserWishlistItem.create({
            user: req.user._id,
            product: productId,
            desiredQuantity: desiredQuantity || 1,
        });

        res.status(201).json({ message: 'Product added to wishlist successfully.', item });
    } catch (error) {
        // Handle the unique index constraint violation (user already has this product)
        if (error.code === 11000) {
            res.status(400);
            throw new Error('This product is already in your wishlist.');
        }
        res.status(500);
        throw new Error(`Failed to add item: ${error.message}`);
    }
});

// @desc    Remove a product from the user's wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    // Find and delete the wishlist item based on the current user AND the product ID
    const result = await UserWishlistItem.deleteOne({
        user: req.user._id,
        product: req.params.id, // ID refers to the Product ID here
    });

    if (result.deletedCount === 0) {
        res.status(404);
        throw new Error('Wishlist item not found.');
    }

    res.json({ message: 'Product removed from wishlist.' });
});

export { getWishlist, addToWishlist, removeFromWishlist };