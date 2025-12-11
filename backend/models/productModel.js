// backend/models/productModel.js
import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    // Basic Product Identification
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Cleaning Supplies', 'Personal Care', 'Kitchenware'
    brand: { type: String, required: true },
    
    // Inventory Management
    stock_quantity: { type: Number, required: true, default: 0 },
    reorder_point: { type: Number, default: 50 }, // Admin can set a trigger point for low-stock alerts
    
    // Pricing Logic (Crucial for Roles)
    base_price: { type: Number, required: true, default: 0 }, // Price for the Individual Buyer (B2C)
    retailer_discount: { type: Number, default: 0 }, // Discount percentage (0.0 to 1.0) for Retailers (B2B)
    
    // Example: If base_price is 10.00 and retailer_discount is 0.2 (20%), 
    // the Retailer price is 8.00.
    
    description: { type: String, required: true },
    image_url: { type: String, default: '/images/placeholder.jpg' },
  },
  {
    timestamps: true, // Automatically track creation and update times
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;