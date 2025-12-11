import mongoose from 'mongoose';

const wishlistItemSchema = mongoose.Schema(
  {
    // CRITICAL: Link to the User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
    },
    
    // CRITICAL: Link to the Product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product', 
    },

    // Optional: Quantity they usually order
    desiredQuantity: {
        type: Number,
        default: 1,
    },
    
    // The incorrect 'unique: true' field has been REMOVED from here.
  },
  {
    timestamps: true, // Tracks when they added it
  }
);

// CORRECT WAY TO ENFORCE UNIQUENESS (Compound Index):
// Ensures a user cannot add the same product twice to their wishlist
wishlistItemSchema.index({ user: 1, product: 1 }, { unique: true }); // <-- This is correct

const UserWishlistItem = mongoose.model('UserWishlistItem', wishlistItemSchema);

export default UserWishlistItem;