// backend/controllers/orderController.js
import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
// @desc    Create new order
// @route   POST /api/orders
// @access  Private (All authenticated users: Admin, Retailer, Individual Buyer)
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Basic validation (In a real app, you'd verify prices against the database)
    const order = new Order({
      user: req.user._id, // User ID attached by 'protect' middleware
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    
    // 💡 Inventory Update Logic (CRITICAL)
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock_quantity -= item.qty;
        await product.save();
      }
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Allows all users to see their own order details)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email role'
  );

  if (order) {
    // SECURITY CHECK: Ensure the user is the owner OR an admin
    if (order.user._id.toString() === req.user._id.toString() || req.role === 'admin') {
      res.json(order);
    } else {
      res.status(403); // Forbidden
      throw new Error('Not authorized to view this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status to Shipped/Delivered
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const { status } = req.body;

  if (order) {
    // Only Admin can update status
    if (req.role !== 'admin') {
        res.status(403); 
        throw new Error('Only Admin can update order status');
    }
    
    order.orderStatus = status; // e.g., 'Processing', 'Shipped', 'Delivered'
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  // Only Admin is allowed to view ALL orders (checked by RBAC middleware in the route)
  const orders = await Order.find({}).populate('user', 'id name email role');
  res.json(orders);
});

// @desc    Get logged-in user's orders (Retailer & Individual Buyer)
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  // Find orders where the 'user' field matches the logged-in user's ID
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});


export { addOrderItems, getOrderById, updateOrderStatus, getOrders, getMyOrders };