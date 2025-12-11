// backend/models/orderModel.js
import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    // Link to the User who placed the order (Retailer or Individual Buyer)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // References the User Model
    },
    
    // Order Details
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true }, // Store the actual price at time of purchase
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product', // References the Product Model
        },
      },
    ],

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    
    // Status and Payment
    paymentMethod: { type: String, required: true },
    paymentResult: { id: String, status: String, update_time: String, email_address: String },
    
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;