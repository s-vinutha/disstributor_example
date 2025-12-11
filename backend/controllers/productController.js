// backend/controllers/productController.js
import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// Helper function to calculate the product price based on the user's role
const calculatePrice = (product, role) => {
  const basePrice = product.base_price;
  let finalPrice = basePrice;
  
  if (role === 'retailer') {
    // Apply the retailer discount percentage
    finalPrice = basePrice * (1 - product.retailer_discount);
  } 
  // Individual Buyers (default) get the base_price

  return parseFloat(finalPrice.toFixed(2));
};

// @desc    Fetch all products with role-specific pricing
// @route   GET /api/products
// @access  Public (Pricing adjusted based on authentication status)
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  
  // Determine the user's role from the request object (attached by 'protect' middleware)
  const userRole = req.role; 
  
  const productsWithPrice = products.map(product => {
    // Calculate the price the current user sees
    const priceToDisplay = calculatePrice(product, userRole);
    
    return {
      _id: product._id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
      
      // Send only the price relevant to the role
      price: priceToDisplay, 
      
      // Optionally, only show the base_price and discount to the Admin
      base_price: userRole === 'admin' ? product.base_price : undefined,
      retailer_discount: userRole === 'admin' ? product.retailer_discount : undefined,
    };
  });
  
  res.json(productsWithPrice);
});

// @desc    Create a single product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // Destructure product details from the request body
  const { sku, name, category, brand, base_price, retailer_discount, stock_quantity, description, image_url } = req.body;
  
  const product = new Product({
    sku,
    name,
    category,
    brand,
    base_price,
    retailer_discount,
    stock_quantity,
    description,
    image_url,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});


// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { sku, name, category, brand, base_price, retailer_discount, stock_quantity, description, image_url } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
        // Update all fields
        product.sku = sku || product.sku;
        product.name = name || product.name;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.base_price = base_price !== undefined ? base_price : product.base_price;
        product.retailer_discount = retailer_discount !== undefined ? retailer_discount : product.retailer_discount;
        product.stock_quantity = stock_quantity !== undefined ? stock_quantity : product.stock_quantity;
        product.description = description || product.description;
        product.image_url = image_url || product.image_url;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


export { getProducts, createProduct, updateProduct };